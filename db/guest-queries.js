import pool from './pool.js';

export async function getAllBlogs() {
    const sql = `select id, title, created_at, likes from blogs where published=true order by created_at desc`;

    const result = await pool.query(sql);
    return result.rows;
}

export async function getBlog(id) {
    const sql = `select * from blogs where id=$1 and published=true`;
    const result = await pool.query(sql, [id]);
    return result.rows[0];
}

export async function getBlogComments(id) {
    const sql = `select * from comments where blog_id=$1 order by created_at desc`;
    const result = await pool.query(sql, [id]);
    return result.rows;
}

export async function insertNewComment(comment, blog_id) {
    const sql = `
        insert into comments (author_name, content, blog_id) 
        values ($1, $2, $3) 
        returning *
    `;
    const result = await pool.query(sql, [comment.author_name, comment.content, blog_id]);
    return result.rows[0];
}

export async function addLike(blog_id) {
    const sql = `
        update blogs 
        set likes = likes + 1 
        where id=$1 and published=true
        returning likes
    `;
    const result = await pool.query(sql, [blog_id]);
    return result.rows[0];
}

export async function removeLike(blog_id) {
    const sql = `
        update blogs 
        set likes = likes - 1
        where id=$1 and published=true
        returning likes
    `;
    const result = await pool.query(sql, [blog_id]);
    return result.rows[0];
}
