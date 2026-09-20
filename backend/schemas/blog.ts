import { z } from 'zod';

export const newBlogBodySchema = z.object({
    title: z.string().trim().min(1, 'Title and Content are required'),
    content: z.string().trim().min(1, 'Title and Content are required'),
    published: z.boolean().optional(),
});

export const updateBlogBodySchema = z.object({
    title: z.string().trim().min(1).optional(),
    content: z.string().trim().min(1).optional(),
    published: z.boolean().optional(),
});

export const newCommentBodySchema = z.object({
    author_name: z.string().trim().min(1, 'Name and Content are required'),
    content: z.string().trim().min(1, 'Name and Content are required'),
});

export const likeBodySchema = z.object({
    liked: z.boolean(),
});
