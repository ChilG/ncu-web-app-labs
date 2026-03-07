import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import teacherRouter from './routes/teacher';
import uploadRouter from './routes/upload';
import studentRouter from './routes/student';
import { initTables } from './connection/init';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use('/teacher', teacherRouter);
app.use('/upload', uploadRouter);
app.use('/student', studentRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello! Mr.Goe');
});

initTables();

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}

export default app;
