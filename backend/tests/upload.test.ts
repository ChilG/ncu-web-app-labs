import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index';
import path from 'path';
import fs from 'fs';

chai.use(chaiHttp);
const { expect } = chai;

describe('Upload API', () => {
    const testFilePath = path.join(__dirname, 'test-image.png');

    before(() => {
        fs.writeFileSync(testFilePath, 'dummy image content');
    });

    after(() => {
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    it('should upload a file successfully', (done) => {
        // @ts-ignore
        chai.request(app)
            .post('/upload')
            .attach('file', fs.readFileSync(testFilePath), 'test-image.png')
            .end((err: any, res: any) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'File uploaded successfully');
                expect(res.body).to.have.property('path');
                done();
            });
    });

    it('should fail when no file is uploaded', (done) => {
        // @ts-ignore
        chai.request(app)
            .post('/upload')
            .end((err: any, res: any) => {
                expect(res).to.have.status(400);
                expect(res.text).to.equal('No file uploaded.');
                done();
            });
    });
});
