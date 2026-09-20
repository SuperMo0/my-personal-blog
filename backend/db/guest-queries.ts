import type { BlogRow, BlogSummaryRow, CommentRow } from '../types.ts';
import pool from './pool.ts';

export async function getAllBlogs(): Promise<BlogSummaryRow[]> {
    const sql = `select id, title, created_at, likes from blogs where published=true order by created_at desc`;

    const result = await pool.query<BlogSummaryRow>(sql);
    return result.rows;
}

export async function getBlog(id: string): Promise<BlogRow | undefined> {
    const sql = `select * from blogs where id=$1 and published=true`;
    const result = await pool.query<BlogRow>(sql, [id]);
    return result.rows[0];
}

export async function getBlogComments(id: string): Promise<CommentRow[]> {
    const sql = `select * from comments where blog_id=$1 order by created_at desc`;
    const result = await pool.query<CommentRow>(sql, [id]);
    return result.rows;
}

export async function insertNewComment(
    comment: { author_name: string; content: string },
    blog_id: string,
): Promise<CommentRow> {
    const sql = `
        insert into comments (author_name, content, blog_id)
        values ($1, $2, $3)
        returning *
    `;
    const result = await pool.query<CommentRow>(sql, [comment.author_name, comment.content, blog_id]);
    return result.rows[0];
}

export async function addLike(blog_id: string): Promise<{ likes: number } | undefined> {
    const sql = `
        update blogs
        set likes = likes + 1
        where id=$1 and published=true
        returning likes
    `;
    const result = await pool.query<{ likes: number }>(sql, [blog_id]);
    return result.rows[0];
}

export async function removeLike(blog_id: string): Promise<{ likes: number } | undefined> {
    const sql = `
        update blogs
        set likes = likes - 1
        where id=$1 and published=true
        returning likes
    `;
    const result = await pool.query<{ likes: number }>(sql, [blog_id]);
    return result.rows[0];
}
