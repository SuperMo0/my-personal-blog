import type { Request, Response } from 'express';
import type { IdRequest } from '../express.d.ts';
import * as guestBlogService from '../services/guestBlogService.ts';

export async function handleGetAllBlogs(_req: Request, res: Response): Promise<void> {
    const blogs = await guestBlogService.listPublishedBlogs();
    res.json({ blogs });
}

export async function handleGetBlog(req: IdRequest, res: Response): Promise<void> {
    const blog = await guestBlogService.getPublishedBlog(req.params.id);
    res.json({ blog });
}

export async function handleGetBlogComments(req: IdRequest, res: Response): Promise<void> {
    const comments = await guestBlogService.getBlogComments(req.params.id);
    res.json({ comments });
}

export async function handleNewComment(req: IdRequest, res: Response): Promise<void> {
    const comment = await guestBlogService.addComment(req.params.id, req.body);
    res.status(201).json({ comment });
}

export async function handleNewLike(req: IdRequest, res: Response): Promise<void> {
    const likes = await guestBlogService.setLike(req.params.id, req.body.liked);
    res.json({ message: 'success', likes });
}
