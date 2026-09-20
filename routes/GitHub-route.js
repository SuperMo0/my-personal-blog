import express from 'express';

export default function createGitHubRouter(getGitHubActivity) {
    const router = express.Router();

    router.get('/', async (_req, res) => {
        try {
            const activity = await getGitHubActivity();
            const cacheControl = activity.stale
                ? 'public, max-age=60, stale-if-error=86400'
                : 'public, max-age=21600, stale-if-error=86400';
            res.set('Cache-Control', cacheControl);
            res.json(activity);
        } catch (error) {
            console.error('Unable to load GitHub activity:', error.message);
            res.status(503).json({ message: 'GitHub activity is temporarily unavailable' });
        }
    });

    return router;
}
