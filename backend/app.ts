import fs from 'node:fs/promises';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import type { Options as RateLimitOptions } from 'express-rate-limit';
import helmet from 'helmet';
import * as guestQueries from './db/guest-queries.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import adminRouter from './routes/Admin-route.ts';
import contributionsRouter from './routes/Contributions-route.ts';
import createGitHubRouter from './routes/GitHub-route.ts';
import createGuestRouter from './routes/Guest-route.ts';
import { createGitHubActivity } from './services/githubActivityService.ts';
import { articleMeta, injectMeta, renderSitemap, SITE_URL, staticMeta } from './utils/seo.ts';

const ALLOWED_ORIGINS = [SITE_URL, 'http://localhost:5173', 'http://localhost:4173'];

async function metaForPath(pathname: string) {
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

export interface CreateAppOptions {
    githubToken?: string;
    githubFetch?: typeof fetch;
    githubRequestTimeoutMs?: number;
    commentRateLimit?: Partial<RateLimitOptions>;
    likeRateLimit?: Partial<RateLimitOptions>;
}

export function createApp({
    githubToken,
    githubFetch,
    githubRequestTimeoutMs,
    commentRateLimit,
    likeRateLimit,
}: CreateAppOptions = {}) {
    const app = express();
    const getGitHubActivity = createGitHubActivity({
        token: githubToken,
        fetchImpl: githubFetch,
        requestTimeoutMs: githubRequestTimeoutMs,
    });

    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }

    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors({ origin: ALLOWED_ORIGINS }));
    app.use('/api/blogs', createGuestRouter({ commentRateLimit, likeRateLimit }));
    app.use('/api/admin', adminRouter);
    app.use('/api/open-source-contributions', contributionsRouter);
    app.use('/api/github-activity', createGitHubRouter(getGitHubActivity));

    app.get('/sitemap.xml', async (_req, res) => {
        try {
            const blogs = await guestQueries.getAllBlogs();
            res.type('application/xml').send(renderSitemap(blogs));
        } catch (error) {
            console.error('Sitemap error:', error);
            res.status(500).end();
        }
    });

    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        const staticPath = path.join(import.meta.dirname, '../frontend/dist');
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

    app.use(errorHandler);

    return app;
}

const app = createApp();

export default app;
