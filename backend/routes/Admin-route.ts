import express, { Router } from 'express';
import * as controller from '../controllers/admin.ts';
import * as authController from '../controllers/auth.ts';
import * as contributions from '../controllers/contributions.ts';
import { authorizeAccess, requireAdmin } from '../middleware/auth.ts';
import { validateBody, validateParams } from '../middleware/validate.ts';
import { loginBodySchema } from '../schemas/auth.ts';
import { newBlogBodySchema, updateBlogBodySchema } from '../schemas/blog.ts';
import { idParamSchema } from '../schemas/common.ts';
import { newContributionBodySchema, updateContributionBodySchema } from '../schemas/contribution.ts';

const router = Router();

router.post('/login', express.json(), validateBody(loginBodySchema), authController.authenticateAdmin);
router.post('/demo-login', authController.authenticateDemo);

router.use(authorizeAccess);

router.get('/blogs', controller.handleGetAllBlogs);

router.get('/blogs/:id', validateParams(idParamSchema), controller.handleGetBlog);

router.get('/blogs/:id/comments', validateParams(idParamSchema), controller.handleGetBlogComments);

router.post('/blogs', requireAdmin, express.json(), validateBody(newBlogBodySchema), controller.handleNewBlog);

router.put(
    '/blogs/:id',
    requireAdmin,
    validateParams(idParamSchema),
    express.json(),
    validateBody(updateBlogBodySchema),
    controller.handleUpdateBlog,
);

router.delete('/blogs/:id', requireAdmin, validateParams(idParamSchema), controller.handleDeleteBlog);

router.get('/contributions', contributions.handleGetAllContributions);

router.post(
    '/contributions',
    requireAdmin,
    express.json(),
    validateBody(newContributionBodySchema),
    contributions.handleNewContribution,
);

router.put(
    '/contributions/:id',
    requireAdmin,
    validateParams(idParamSchema),
    express.json(),
    validateBody(updateContributionBodySchema),
    contributions.handleUpdateContribution,
);

router.delete(
    '/contributions/:id',
    requireAdmin,
    validateParams(idParamSchema),
    contributions.handleDeleteContribution,
);

export default router;
