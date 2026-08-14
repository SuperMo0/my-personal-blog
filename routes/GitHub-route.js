import express from 'express';

export default function createGitHubRouter(getGitHubActivity) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            const activity = await getGitHubActivity();
            res.set('Cache-Control', 'public, max-age=21600, stale-if-error=86400');
            res.json(activity);
        } catch (error) {
            console.error('Unable to load GitHub activity:', error.message);
            res.status(503).json({ message: 'GitHub activity is temporarily unavailable' });
        }
    });

    return router;
}
