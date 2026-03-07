import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index';
import { query } from '../src/connection/db';
import { initTables } from '../src/connection/init';

chai.use(chaiHttp);
const { expect } = chai;

describe('Student API', () => {
    let token: string;
    let studentId: string;

    before(async () => {
        await initTables();
        // Clear students table before tests
        await query('DELETE FROM students');
        
        // Ensure admin teacher exists
        await query('DELETE FROM teachers WHERE username = ?', ['admin']);
        const bcrypt = require('bcrypt');
        const PEPPER = process.env.PASSWORD_PEPPER || 'default-pepper-secret';
        const pepperedPassword = `${PEPPER}password123${PEPPER}`;
        const hashedPassword = await bcrypt.hash(pepperedPassword, 10);
        
        await query(
            'INSERT INTO teachers (id, name, department, picture, username, password) VALUES (?, ?, ?, ?, ?, ?)',
            ['1', 'Admin Teacher', 'Admin Dept', 'http://example.com/pic.jpg', 'admin', hashedPassword]
        );

        // Login to get token
        const res = await chai.request(app)
            .post('/teacher/login')
            .send({
                username: 'admin',
                password: 'password123'
            });
        
        token = res.body.token;
    });

    after(async () => {
        // Cleanup after tests
        await query('DELETE FROM students');
        await query('DELETE FROM teachers WHERE username = ?', ['admin']);
    });

    it('should create a new student', async () => {
        const res = await chai.request(app)
            .post('/student')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'John Doe',
                age: 20,
                email: 'john.doe@example.com',
                major: 'Computer Science'
            });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        expect(res.body.name).to.equal('John Doe');
        studentId = res.body.id;
    });

    it('should get all students', async () => {
        const res = await chai.request(app)
            .get('/student')
            .set('Authorization', `Bearer ${token}`);

        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('array');
        expect(res.body.data.length).to.be.at.least(1);
    });

    it('should update a student', async () => {
        const res = await chai.request(app)
            .put(`/student/${studentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Jane Doe',
                age: 22,
                email: 'jane.doe@example.com',
                major: 'Mathematics'
            });

        expect(res).to.have.status(200);
        expect(res.body.name).to.equal('Jane Doe');
        expect(res.body.major).to.equal('Mathematics');
    });

    it('should delete a student', async () => {
        const res = await chai.request(app)
            .delete(`/student/${studentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res).to.have.status(204);
    });

    it('should return 404 for deleted student', async () => {
        const res = await chai.request(app)
            .put(`/student/${studentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Jane Doe',
                age: 22,
                email: 'jane.doe@example.com',
                major: 'Mathematics'
            });

        expect(res).to.have.status(404);
    });
});
