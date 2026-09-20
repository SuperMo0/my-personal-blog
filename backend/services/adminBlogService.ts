import type { BlogUpdateInput, NewBlogInput } from '../db/admin-queries.ts';
import * as queries from '../db/admin-queries.ts';
import { ConflictError, isForeignKeyViolation, NotFoundError } from '../errors.ts';
import type { BlogRow, BlogSummaryRow, CommentRow, SessionUser } from '../types.ts';

export async function listBlogsForUser(user: SessionUser): Promise<BlogSummaryRow[]> {
    return queries.getAllBlogs(user);
}

export async function getBlogForUser(id: string, user: SessionUser): Promise<BlogRow> {
    const blog = await queries.getBlog(id, user);
    if (!blog) {
        throw new NotFoundError('Blog not found');
    }
    return blog;
}

export async function getBlogCommentsForUser(id: string, user: SessionUser): Promise<CommentRow[]> {
    return queries.getAllBlogComments(id, user);
}

export async function createBlog(
    blog: NewBlogInput,
    authorId: number,
): Promise<Pick<BlogRow, 'id' | 'title' | 'created_at'>> {
    return queries.insertBlog(blog, authorId);
}

export async function updateBlog(id: string, blog: BlogUpdateInput): Promise<void> {
    const updated = await queries.updateBlog(id, blog);
    if (!updated) {
        throw new NotFoundError('Blog not found or no changes made');
    }
}

export async function deleteBlog(id: string): Promise<void> {
    try {
        const deleted = await queries.deleteBlog(id);
        if (!deleted) {
            throw new NotFoundError('Blog not found');
        }
    } catch (error) {
        if (error instanceof NotFoundError) throw error;
        if (isForeignKeyViolation(error)) {
            throw new ConflictError('Cannot delete blog because it has related data');
        }
        throw error;
    }
}
