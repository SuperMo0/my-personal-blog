import express from 'express';
import { ServiceUnavailableError } from '../errors.ts';
import type { GitHubActivity } from '../services/githubActivityService.ts';

export default function createGitHubRouter(getGitHubActivity: () => Promise<GitHubActivity>) {
    const router = express.Router();

    router.get('/', async (_req, res) => {
        let activity: GitHubActivity;
        try {
            activity = await getGitHubActivity();
        } catch (error) {
            console.error('Unable to load GitHub activity:', (error as Error).message);
            throw new ServiceUnavailableError('GitHub activity is temporarily unavailable');
        }
        res.set('Cache-Control', 'public, max-age=21600, stale-if-error=86400');
        res.json(activity);
    });

    return router;
}
