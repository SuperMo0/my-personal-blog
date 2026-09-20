import * as queries from '../db/guest-queries.ts';
import { isForeignKeyViolation, NotFoundError } from '../errors.ts';
import type { BlogRow, BlogSummaryRow, CommentRow } from '../types.ts';

export async function listPublishedBlogs(): Promise<BlogSummaryRow[]> {
    return queries.getAllBlogs();
}

export async function getPublishedBlog(id: string): Promise<BlogRow> {
    const blog = await queries.getBlog(id);
    if (!blog) {
        throw new NotFoundError('Blog not found');
    }
    return blog;
}

export async function getBlogComments(id: string): Promise<CommentRow[]> {
    return queries.getBlogComments(id);
}

export async function addComment(
    blogId: string,
    comment: { author_name: string; content: string },
): Promise<CommentRow> {
    try {
        return await queries.insertNewComment(comment, blogId);
    } catch (error) {
        if (isForeignKeyViolation(error)) {
            throw new NotFoundError('Blog not found');
        }
        throw error;
    }
}

export async function setLike(blogId: string, liked: boolean): Promise<number> {
    const result = liked ? await queries.addLike(blogId) : await queries.removeLike(blogId);
    if (!result) {
        throw new NotFoundError('Blog not found');
    }
    return result.likes;
}
