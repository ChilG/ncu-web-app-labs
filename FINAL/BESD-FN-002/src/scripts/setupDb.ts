import pool from "../connection/db";

async function setup() {
    try {
        console.log("Setting up se_course_db Database...");

        // 1. Create DB if it doesn't exist
        await pool.query(`CREATE DATABASE IF NOT EXISTS se_course_db;`);
        await pool.query(`USE se_course_db;`);
        
        console.log("Database created/selected.");

        // 2. Creating User Table
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
        await pool.query(userTable);
        console.log("User table created.");

        // 3. Insert Dummy Data (using bcrypt to hash passwords)
        const bcrypt = require('bcrypt');
        const saltRounds = 10;

        const users = [
            {
                email: 'daranporn@gmail.com',
                pass: 'yjdf1716',
                fname: 'ดรัลพร',
                lname: 'อุดมทรัพย์',
                tel: '0891234567',
                dob: '2012-05-26'
            },
            {
                email: 'boonpoj@gmail.com',
                pass: 'mmjt9876',
                fname: 'บุณพจน์',
                lname: 'รัชนิพิมาย',
                tel: '0641825563',
                dob: '2011-10-17'
            },
            {
                email: 'bodin_thai@gmail.com',
                pass: 'mmyb4577',
                fname: 'บดินทร์',
                lname: 'วัชรจิระกุล',
                tel: '0986345661',
                dob: '2007-04-29'
            }
        ];

        for (const u of users) {
             // Check if user already exists
             const [rows]: any = await pool.query('SELECT userEmail FROM user WHERE userEmail = ?', [u.email]);
             if (rows.length === 0) {
                 const hashedPass = await bcrypt.hash(u.pass, saltRounds);
                 await pool.query(
                     'INSERT INTO user (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?)',
                     [u.email, hashedPass, u.fname, u.lname, u.tel, u.dob]
                 );
             }
        }
        
        console.log("Sample users inserted successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Error setting up database:", error);
        process.exit(1);
    }
}

setup();
