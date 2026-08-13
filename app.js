import express from 'express';
import cors from 'cors';
import path from 'path';
import guestRouter from './Routes/Guest-route.js';
import adminRouter from './Routes/Admin-route.js';
import createGitHubRouter from './Routes/GitHub-route.js';
import { createGitHubActivity } from './utils/github-activity.js';

export function createApp({
    githubToken,
    githubFetch,
    githubRequestTimeoutMs,
} = {}) {
    const app = express();
    const getGitHubActivity = createGitHubActivity({
        token: githubToken,
        fetchImpl: githubFetch,
        requestTimeoutMs: githubRequestTimeoutMs,
    });

    app.use(cors());
    app.use('/api/blogs', guestRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/github-activity', createGitHubRouter(getGitHubActivity));

    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        const staticPath = path.join(process.cwd(), 'Frontend/dist');

        app.use(express.static(staticPath));
        app.get('/{*splat}', (req, res) => {
            res.sendFile(path.join(staticPath, 'index.html'));
        });
    }

    return app;
}

const app = createApp();

export default app;
