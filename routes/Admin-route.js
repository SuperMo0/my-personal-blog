import express, { Router } from 'express';
import * as controller from './../controllers/admin.js';
import * as auth from './../controllers/auth.js';
import * as contributions from './../controllers/contributions.js';
import * as validate from './../utils/validate.js';

const router = Router();

router.post('/login', express.json(), auth.authenticateAdmin);
router.post('/demo-login', auth.authenticateDemo);

router.use(auth.authorizeAccess);

router.get('/blogs', controller.handleGetAllBlogs);

router.get('/blogs/:id', validate.validateParamId, controller.handleGetBlog);

router.get('/blogs/:id/comments', validate.validateParamId, controller.handleGetBlogComments);

router.post('/blogs', auth.requireAdmin, express.json(), controller.handleNewBlog);

router.put('/blogs/:id', auth.requireAdmin, validate.validateParamId, express.json(), controller.handleUpdateBlog);

router.delete('/blogs/:id', auth.requireAdmin, validate.validateParamId, controller.handleDeleteBlog);

router.get('/contributions', contributions.handleGetAllContributions);

router.post('/contributions', auth.requireAdmin, express.json(), contributions.handleNewContribution);

router.put(
    '/contributions/:id',
    auth.requireAdmin,
    validate.validateParamId,
    express.json(),
    contributions.handleUpdateContribution,
);

router.delete(
    '/contributions/:id',
    auth.requireAdmin,
    validate.validateParamId,
    contributions.handleDeleteContribution,
);

export default router;
