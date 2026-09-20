import type { BlogRow, BlogSummaryRow, CommentRow, SessionUser, UserRow } from '../types.ts';
import pool from './pool.ts';

export async function getAllBlogs(user: SessionUser): Promise<BlogSummaryRow[]> {
    const isAdmin = user.role === 'admin';
    const sql = `
        select id, title, created_at, likes, published
        from blogs
        where $1 = true or published = true or author_id = $2
        order by created_at desc
    `;
    const result = await pool.query<BlogSummaryRow>(sql, [isAdmin, user.id]);
    return result.rows;
}

export async function getAllComments(): Promise<CommentRow[]> {
    const sql = `select * from comments order by created_at desc`;
    const result = await pool.query<CommentRow>(sql);
    return result.rows;
}

export async function getAllBlogComments(blog_id: string, user: SessionUser): Promise<CommentRow[]> {
    const isAdmin = user.role === 'admin';
    const sql = `
        select comments.*
        from comments
        join blogs on blogs.id = comments.blog_id
        where comments.blog_id = $1
          and ($2 = true or blogs.published = true or blogs.author_id = $3)
        order by comments.created_at desc
    `;
    const result = await pool.query<CommentRow>(sql, [blog_id, isAdmin, user.id]);
    return result.rows;
}

export async function getBlog(id: string, user: SessionUser): Promise<BlogRow | undefined> {
    const isAdmin = user.role === 'admin';
    const sql = `
        select * from blogs
        where id = $1 and ($2 = true or published = true or author_id = $3)
    `;
    const result = await pool.query<BlogRow>(sql, [id, isAdmin, user.id]);
    return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
    const sql = `select * from users where email=$1`;
    const result = await pool.query<UserRow>(sql, [email]);
    return result.rows[0];
}

export interface NewBlogInput {
    title: string;
    content: string;
    published?: boolean;
}

export async function insertBlog(
    blog: NewBlogInput,
    user_id: number,
): Promise<Pick<BlogRow, 'id' | 'title' | 'created_at'>> {
    const sql = `
        insert into blogs (title, content, author_id, published)
        values ($1, $2, $3, $4)
        returning id, title, created_at
    `;
    const result = await pool.query<Pick<BlogRow, 'id' | 'title' | 'created_at'>>(sql, [
        blog.title,
        blog.content,
        user_id,
        blog.published || false,
    ]);
    return result.rows[0];
}

export interface BlogUpdateInput {
    title?: string;
    content?: string;
    published?: boolean;
}

export async function updateBlog(id: string, blog: BlogUpdateInput): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let queryIndex = 1;

    if (blog.content !== undefined) {
        fields.push(`content = $${queryIndex++}`);
        values.push(blog.content);
    }
    if (blog.title !== undefined) {
        fields.push(`title = $${queryIndex++}`);
        values.push(blog.title);
    }
    if (blog.published !== undefined) {
        fields.push(`published = $${queryIndex++}`);
        values.push(blog.published);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const sql = `update blogs set ${fields.join(', ')} where id = $${queryIndex} returning id`;

    const result = await pool.query(sql, values);
    return (result.rowCount ?? 0) > 0;
}

export async function deleteBlog(id: string): Promise<boolean> {
    const sql = `delete from blogs where id=$1`;
    const result = await pool.query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
}
