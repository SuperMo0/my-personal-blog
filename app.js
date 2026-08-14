import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import guestRouter from './Routes/Guest-route.js';
import adminRouter from './Routes/Admin-route.js';
import createGitHubRouter from './Routes/GitHub-route.js';
import { createGitHubActivity } from './utils/github-activity.js';
import * as guestQueries from './db/guest-queries.js';
import { articleMeta, injectMeta, renderSitemap, staticMeta } from './utils/seo.js';

async function metaForPath(pathname) {
    const staticPage = staticMeta(pathname);
    if (staticPage) return staticPage;

    const match = pathname.match(/^\/blogs\/(\d+)$/);
    if (!match) return null;

    try {
        const blog = await guestQueries.getBlog(match[1]);
        return blog ? articleMeta(blog) : null;
    } catch (error) {
        console.error('Article meta error:', error);
        return null;
    }
}

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

    app.get('/sitemap.xml', async (req, res) => {
        try {
            const blogs = await guestQueries.getAllBlogs();
            res.type('application/xml').send(renderSitemap(blogs));
        } catch (error) {
            console.error('Sitemap error:', error);
            res.status(500).end();
        }
    });

    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        const staticPath = path.join(process.cwd(), 'Frontend/dist');
        const indexPath = path.join(staticPath, 'index.html');

        app.use(express.static(staticPath));
        app.get('/{*splat}', async (req, res) => {
            try {
                const template = await fs.readFile(indexPath, 'utf8');
                const meta = await metaForPath(req.path);
                res.type('html').send(meta ? injectMeta(template, meta) : template);
            } catch (error) {
                console.error('Page render error:', error);
                res.sendFile(indexPath);
            }
        });
    }

    return app;
}

const app = createApp();

export default app;
