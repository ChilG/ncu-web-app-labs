import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.route';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', userRoutes);

// Export 'app' for testing without starting the server, or listen if ran directly
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
