import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const setupDb = async () => {
    // Create a connection without selecting a specific database first
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'rootpassword'
    });

    try {
        const dbNameMain = process.env.DB_NAME || 'ncu';
        const dbNameTest = process.env.DB_NAME_TEST || `${dbNameMain}_test`;

        console.log(`Ensuring database '${dbNameMain}' exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbNameMain}\`;`);

        console.log(`Ensuring database '${dbNameTest}' exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbNameTest}\`;`);

        console.log('Databases verified successfully! 🎉');
    } catch (error) {
        console.error('Failed to setup databases:', error);
    } finally {
        await connection.end();
    }
};

setupDb();
