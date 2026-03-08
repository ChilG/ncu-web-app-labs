import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function setupTestDb() {
    try {
        console.log("Setting up se_course_db_test for testing...");
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS se_course_db_test;`);
        await connection.query(`USE se_course_db_test;`);
        
        const userTable = `
            CREATE TABLE IF NOT EXISTS user (
                userEmail VARCHAR(85) PRIMARY KEY,
                userPassword VARCHAR(255) NOT NULL,
                userFirstName VARCHAR(50) NOT NULL,
                userLastName VARCHAR(50) NOT NULL,
                userTel VARCHAR(50) NOT NULL,
                dateOfBirth DATE NOT NULL
            );
        `;
        await connection.query(userTable);
        console.log("User table created in se_course_db_test.");
        
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error("Error setting up test database:", error);
        process.exit(1);
    }
}

setupTestDb();
