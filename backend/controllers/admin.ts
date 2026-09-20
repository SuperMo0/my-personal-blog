import type { Request, Response } from 'express';
import type { IdRequest } from '../express.d.ts';
import * as adminBlogService from '../services/adminBlogService.ts';

export async function handleGetAllBlogs(req: Request, res: Response): Promise<void> {
    const blogs = await adminBlogService.listBlogsForUser(req.user);
    res.json({ blogs });
}

export async function handleGetBlog(req: IdRequest, res: Response): Promise<void> {
    const blog = await adminBlogService.getBlogForUser(req.params.id, req.user);
    res.json({ blog });
}

export async function handleGetBlogComments(req: IdRequest, res: Response): Promise<void> {
    const comments = await adminBlogService.getBlogCommentsForUser(req.params.id, req.user);
    res.json({ comments });
}

export async function handleNewBlog(req: Request, res: Response): Promise<void> {
    await adminBlogService.createBlog(req.body, req.user.id);
    res.status(201).json({ message: 'success' });
}

export async function handleUpdateBlog(req: IdRequest, res: Response): Promise<void> {
    await adminBlogService.updateBlog(req.params.id, req.body);
    res.json({ message: 'success' });
}

export async function handleDeleteBlog(req: IdRequest, res: Response): Promise<void> {
    await adminBlogService.deleteBlog(req.params.id);
    res.json({ message: 'success' });
}
