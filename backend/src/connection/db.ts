import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbNameMain = process.env.DB_NAME || 'ncu';
const dbNameTest = process.env.DB_NAME_TEST || `${dbNameMain}_test`;
const dbName = process.env.NODE_ENV === 'test' ? dbNameTest : dbNameMain;

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function query(sql: string, params?: any[]) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export default pool;
