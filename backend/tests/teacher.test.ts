import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index';
import { query } from '../src/connection/db';
import { initTables } from '../src/connection/init';

chai.use(chaiHttp);
const { expect } = chai;

const PEPPER = process.env.PASSWORD_PEPPER || 'default-pepper-secret';

describe('Teacher API', () => {
    const adminTeacher = {
        id: 'A0001',
        name: 'Admin Teacher',
        department: 'Administration',
        picture: 'http://example.com/admin.jpg',
        username: 'admin1',
        password: 'adminpassword123'
    };

    const testTeacher = {
        id: 'T9999',
        name: 'Test Teacher',
        department: 'Science',
        picture: 'http://example.com/pic.jpg',
        username: 'testteacher99',
        password: 'password123'
    };

    let authToken = '';

    // Clean up before and after tests
    before(async () => {
        await initTables();
        await query('DELETE FROM teachers WHERE id IN (?, ?)', [testTeacher.id, adminTeacher.id]);
        
        // Seed an admin teacher directly in DB to get our first token
        const bcrypt = require('bcrypt');
        const pepperedPassword = `${PEPPER}${adminTeacher.password}${PEPPER}`;
        const hashedPassword = await bcrypt.hash(pepperedPassword, 10);
        await query(
            'INSERT INTO teachers (id, name, department, picture, username, password) VALUES (?, ?, ?, ?, ?, ?)',
            [adminTeacher.id, adminTeacher.name, adminTeacher.department, adminTeacher.picture, adminTeacher.username, hashedPassword]
        );
    });

    after(async () => {
        await query('DELETE FROM teachers WHERE id IN (?, ?)', [testTeacher.id, adminTeacher.id]);
    });

    it('should login as admin and get token', (done) => {
        // @ts-ignore
        chai.request(app)
            .post('/teacher/login')
            .send({
                username: adminTeacher.username,
                password: adminTeacher.password
            })
            .end((err: any, res: any) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property('token');
                authToken = res.body.token;
                done();
            });
    });

    it('should create a new teacher', (done) => {
        // @ts-ignore
        chai.request(app)
            .post('/teacher')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testTeacher)
            .end((err: any, res: any) => {
                expect(res.status).to.equal(201);
                expect(res.body).to.include({
                    id: testTeacher.id,
                    name: testTeacher.name,
                    department: testTeacher.department,
                    username: testTeacher.username
                });
                done();
            });
    });

    it('should get all teachers', (done) => {
        // @ts-ignore
        chai.request(app)
            .get('/teacher')
            .end((err: any, res: any) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property('data');
                expect(res.body.data).to.be.an('array');
                done();
            });
    });

    it('should login a teacher', (done) => {
        // @ts-ignore
        chai.request(app)
            .post('/teacher/login')
            .send({
                username: testTeacher.username,
                password: testTeacher.password
            })
            .end((err: any, res: any) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal('Login successful');
                expect(res.body.data).to.include({
                    id: testTeacher.id,
                    username: testTeacher.username
                });
                done();
            });
    });

    it('should fail login with wrong password', (done) => {
        // @ts-ignore
        chai.request(app)
            .post('/teacher/login')
            .send({
                username: testTeacher.username,
                password: 'wrongpassword'
            })
            .end((err: any, res: any) => {
                expect(res.status).to.equal(401);
                expect(res.body.error).to.equal('Invalid username or password');
                done();
            });
    });

    it('should fail login with non-existent username', (done) => {
        // @ts-ignore
        chai.request(app)
            .post('/teacher/login')
            .send({
                username: 'nouser123',
                password: testTeacher.password
            })
            .end((err: any, res: any) => {
                expect(res.status).to.equal(401);
                expect(res.body.error).to.equal('Invalid username or password');
                done();
            });
    });

    it('should update a teacher', (done) => {
        const updateData = {
            name: 'Updated Teacher Name',
            department: 'Math',
            picture: 'http://example.com/pic2.jpg',
            username: 'testteacher99upd',
            password: 'newpassword123'
        };

        // @ts-ignore
        chai.request(app)
            .put(`/teacher/${testTeacher.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateData)
            .end((err: any, res: any) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.include({
                    id: testTeacher.id,
                    name: updateData.name,
                    department: updateData.department
                });
                done();
            });
    });

    it('should change teacher password successfully', (done) => {
        const passwordData = {
            oldPassword: 'password123',
            newPassword: 'latestpassword456'
        };

        // @ts-ignore
        chai.request(app)
            .put(`/teacher/${testTeacher.id}/password`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(passwordData)
            .end((err: any, res: any) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal('Password updated successfully');
                done();
            });
    });

    it('should fail to change password with wrong old password', (done) => {
        const passwordData = {
            oldPassword: 'wrongoldpassword',
            newPassword: 'latestpassword456'
        };

        // @ts-ignore
        chai.request(app)
            .put(`/teacher/${testTeacher.id}/password`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(passwordData)
            .end((err: any, res: any) => {
                expect(res.status).to.equal(401);
                expect(res.body.error).to.equal('Invalid old password');
                done();
            });
    });

    it('should delete a teacher', (done) => {
        // @ts-ignore
        chai.request(app)
            .delete(`/teacher/${testTeacher.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err: any, res: any) => {
                expect(res.status).to.equal(204);
                done();
            });
    });

    it('should return 404 for deleted teacher', (done) => {
        // @ts-ignore
        chai.request(app)
            .delete(`/teacher/${testTeacher.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err: any, res: any) => {
                expect(res.status).to.equal(404);
                done();
            });
    });
});
