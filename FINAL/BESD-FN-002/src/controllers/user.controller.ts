import { Request, Response } from 'express';
import pool from '../connection/db';
import bcrypt from 'bcrypt';

// Helper to calculate age from Date
const calculateAge = (dob: Date): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT userEmail, userFirstName, userLastName, userTel, dateOfBirth FROM user');
        
        // Transform the data to include age and omit raw dateOfBirth or password if necessary
        const users = rows.map((u: any) => ({
             userEmail: u.userEmail,
             userFirstName: u.userFirstName,
             userLastName: u.userLastName,
             userTel: u.userTel,
             dateOfBirth: u.dateOfBirth,
             age: calculateAge(u.dateOfBirth)
        }));

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth } = req.body;

        if (!userEmail || !userPassword || !userFirstName || !userLastName || !userTel || !dateOfBirth) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
        }

        // Check if email already exists
        const [existing]: any = await pool.query('SELECT userEmail FROM user WHERE userEmail = ?', [userEmail]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Email นี้มีอยู่ในระบบแล้ว" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

        await pool.query(
            'INSERT INTO user (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?)',
            [userEmail, hashedPassword, userFirstName, userLastName, userTel, dateOfBirth]
        );

        res.status(201).json({ message: "Created" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
