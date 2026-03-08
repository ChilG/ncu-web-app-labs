import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before } from 'mocha';
import app from '../src/index';
import pool from '../src/connection/db';
import bcrypt from 'bcrypt';

chai.use(chaiHttp);
const { expect } = chai;

describe('Integration Tests: User API', () => {

    before(async () => {
        // Clear all users to have a clean state for the test suite
        await pool.query('DELETE FROM user');
        
        // Insert the 3 default users expected by IT-1
        const saltRounds = 10;
        const users = [
            { email: 'daranporn@gmail.com', pass: 'yjdf1716', fname: 'ดรัลพร', lname: 'อุดมทรัพย์', tel: '0891234567', dob: '2012-05-26' },
            { email: 'boonpoj@gmail.com', pass: 'mmjt9876', fname: 'บุณพจน์', lname: 'รัชนิพิมาย', tel: '0641825563', dob: '2011-10-17' },
            { email: 'bodin_thai@gmail.com', pass: 'mmyb4577', fname: 'บดินทร์', lname: 'วัชรจิระกุล', tel: '0986345661', dob: '2007-04-29' }
        ];

        for (const u of users) {
             const hashedPass = await bcrypt.hash(u.pass, saltRounds);
             await pool.query(
                 'INSERT INTO user (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?)',
                 [u.email, hashedPass, u.fname, u.lname, u.tel, u.dob]
             );
        }
    });


    it('IT-1: Should get all users with age and without password', (done) => {
        chai.request(app)
            .get('/users')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.equal(3);
                
                // Verify no password in response and age exists
                res.body.forEach((user: any) => {
                    expect(user).to.not.have.property('userPassword');
                    expect(user).to.have.property('age');
                    expect(user).to.have.property('userEmail');
                });
                done();
            });
    });

    it('IT-2: Should successfully add a new user', (done) => {
        const newUser = {
            userEmail: 'newstudent@gmail.com',
            userPassword: 'newpassword123',
            userFirstName: 'สมชาย',
            userLastName: 'ใจดี',
            userTel: '0812345678',
            dateOfBirth: '2005-01-15'
        };

        chai.request(app)
            .post('/users')
            .send(newUser)
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('message').eql('Created');
                
                // Optional: Verify that the DB now has 4 items
                chai.request(app)
                    .get('/users')
                    .end((err2, res2) => {
                         expect(res2.body.length).to.equal(4);
                         done();
                    });
            });
    });

    it('IT-3: Should fail to add user with existing email (Duplicate)', (done) => {
        const duplicateUser = {
            userEmail: 'daranporn@gmail.com',
            userPassword: 'somepassword',
            userFirstName: 'ดรัลพร',
            userLastName: 'อุดมทรัพย์',
            userTel: '0891234567',
            dateOfBirth: '2012-05-26'
        };

        chai.request(app)
            .post('/users')
            .send(duplicateUser)
            .end((err, res) => {
                // The spec lists Status 400 or 409
                expect(res.status).to.be.oneOf([400, 409]);
                expect(res.body.message).to.include('มีอยู่ในระบบแล้ว');
                done();
            });
    });

    it('IT-4: Should fail if information is incomplete (missing password)', (done) => {
        const incompleteUser = {
            userEmail: 'incomplete@gmail.com',
            // Missing userPassword
            userFirstName: 'ขาด',
            userLastName: 'รหัส',
            userTel: '0888888888',
            dateOfBirth: '2000-01-01'
        };

        chai.request(app)
            .post('/users')
            .send(incompleteUser)
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

});
