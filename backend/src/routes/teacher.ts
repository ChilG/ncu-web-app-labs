import express, { Request, Response } from 'express';
import { query } from '../connection/db';
import { ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';

import { z } from 'zod';

const router = express.Router();

const PEPPER = process.env.PASSWORD_PEPPER || 'default-pepper-secret';
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-key';

const TeacherSchema = z.object({
    id: z.string().max(6),
    name: z.string().max(150),
    department: z.string().max(50),
    picture: z.string().url(),
    username: z.string().max(50),
    password: z.string().min(1).max(255)
});

const TeacherUpdateSchema = z.object({
    name: z.string().max(150),
    department: z.string().max(50),
    picture: z.string().url(),
    username: z.string().max(50),
});

const TeacherChangePasswordSchema = z.object({
    oldPassword: z.string().min(1).max(255),
    newPassword: z.string().min(1).max(255)
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const teachers = await query('SELECT id, name, department, picture, username FROM teachers');
        res.json({ data: teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const validation = TeacherSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: validation.error.format() });
            return;
        }

        const { id, name, department, picture, username, password } = validation.data;

        const pepperedPassword = `${PEPPER}${password}${PEPPER}`;
        const hashedPassword = await bcrypt.hash(pepperedPassword, 10);

        await query(
            'INSERT INTO teachers (id, name, department, picture, username, password) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, department, picture, username, hashedPassword]
        );

        res.status(201).json({
            id,
            name,
            department,
            picture,
            username
        });
    } catch (error: any) {
        console.error('Error creating teacher:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Teacher with this ID already exists' });
            return;
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validation = TeacherUpdateSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: validation.error.format() });
            return;
        }

        const { name, department, picture, username } = validation.data;

        const result = await query(
            'UPDATE teachers SET name = ?, department = ?, picture = ?, username = ? WHERE id = ?',
            [name, department, picture, username, id]
        ) as ResultSetHeader;

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Teacher not found' });
            return;
        }

        res.json({ id, name, department, picture, username });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id/password', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validation = TeacherChangePasswordSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: validation.error.format() });
            return;
        }

        const { oldPassword, newPassword } = validation.data;

        const teachers = await query('SELECT password FROM teachers WHERE id = ?', [id]) as any[];

        if (teachers.length === 0) {
            res.status(404).json({ error: 'Teacher not found' });
            return;
        }

        const teacher = teachers[0];

        const pepperedOldPassword = `${PEPPER}${oldPassword}${PEPPER}`;
        const isPasswordValid = await bcrypt.compare(pepperedOldPassword, teacher.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid old password' });
            return;
        }

        const pepperedNewPassword = `${PEPPER}${newPassword}${PEPPER}`;
        const newHashedPassword = await bcrypt.hash(pepperedNewPassword, 10);

        await query(
            'UPDATE teachers SET password = ? WHERE id = ?',
            [newHashedPassword, id]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM teachers WHERE id = ?', [id]) as ResultSetHeader;

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Teacher not found' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        const teachers = await query(
            'SELECT * FROM teachers WHERE username = ?',
            [username]
        ) as any[];

        if (teachers.length === 0) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const teacher = teachers[0];
        
        const pepperedPassword = `${PEPPER}${password}${PEPPER}`;
        const isPasswordValid = await bcrypt.compare(pepperedPassword, teacher.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const { password: _, ...teacherData } = teacher;

        const token = jwt.sign(
            { id: teacher.id, username: teacher.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', data: teacherData, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
