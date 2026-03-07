import { query } from './db';
import bcrypt from 'bcrypt';

export const initTables = async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id VARCHAR(6) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                department VARCHAR(50) NOT NULL,
                picture VARCHAR(255) NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);
        await query(`
            CREATE TABLE IF NOT EXISTS students (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                age INT NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                major VARCHAR(100) NOT NULL
            )
        `);
        console.log('Table initialized');
        
        const [teachers] = await query('SELECT COUNT(*) as count FROM teachers') as any;
        if (teachers && teachers.count === 0) {
            console.log('No teachers found. Seeding initial admin teacher...');
            const PEPPER = process.env.PASSWORD_PEPPER || 'default-pepper-secret';
            const pepperedPassword = `${PEPPER}admin123${PEPPER}`;
            const hashedPassword = await bcrypt.hash(pepperedPassword, 10);
            
            await query(
                'INSERT INTO teachers (id, name, department, picture, username, password) VALUES (?, ?, ?, ?, ?, ?)',
                ['A00000', 'Administrator', 'System', '', 'admin', hashedPassword]
            );
            console.log('Initial admin teacher seeded successfully! (Username: admin, Password: admin123)');
        }
    } catch (error) {
        console.error('Error initializing tables:', error);
    }
};
