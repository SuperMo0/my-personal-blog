import express, { Router } from 'express';
import type { Options as RateLimitOptions } from 'express-rate-limit';
import * as controller from '../controllers/guest.ts';
import { createRateLimiter } from '../middleware/rateLimit.ts';
import { validateBody, validateParams } from '../middleware/validate.ts';
import { likeBodySchema, newCommentBodySchema } from '../schemas/blog.ts';
import { idParamSchema } from '../schemas/common.ts';

export default function createGuestRouter({
    commentRateLimit = {},
    likeRateLimit = {},
}: {
    commentRateLimit?: Partial<RateLimitOptions>;
    likeRateLimit?: Partial<RateLimitOptions>;
} = {}) {
    const router = Router();

    router.get('/', controller.handleGetAllBlogs);

    router.get('/:id', validateParams(idParamSchema), controller.handleGetBlog);

    router.get('/:id/comments', validateParams(idParamSchema), controller.handleGetBlogComments);

    router.post(
        '/:id',
        createRateLimiter(commentRateLimit),
        validateParams(idParamSchema),
        express.json(),
        validateBody(newCommentBodySchema),
        controller.handleNewComment,
    );

    router.post(
        '/:id/like',
        createRateLimiter(likeRateLimit),
        validateParams(idParamSchema),
        express.json(),
        validateBody(likeBodySchema),
        controller.handleNewLike,
    );

    return router;
}
