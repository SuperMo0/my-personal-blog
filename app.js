import express from 'express';
import cors from 'cors';
import path from 'path';
import guestRouter from './Routes/Guest-route.js';
import adminRouter from './Routes/Admin-route.js';

const app = express();

app.use(cors());
app.use('/api/blogs', guestRouter);
app.use('/api/admin', adminRouter);

if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    const staticPath = path.join(process.cwd(), 'Frontend/dist');

    app.use(express.static(staticPath));
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(staticPath, 'index.html'));
    });
}

export default app;
