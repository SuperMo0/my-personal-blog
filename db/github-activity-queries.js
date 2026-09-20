import pool from './pool.js';

export async function getGithubActivitySnapshot() {
    const sql = `select payload, fetched_at from github_activity_snapshot where id = 1`;
    const result = await pool.query(sql);
    const row = result.rows[0];
    if (!row) return null;
    return { payload: row.payload, fetchedAt: row.fetched_at.toISOString() };
}

export async function saveGithubActivitySnapshot(payload) {
    const sql = `
        insert into github_activity_snapshot (id, payload, fetched_at)
        values (1, $1, now())
        on conflict (id) do update set payload = excluded.payload, fetched_at = excluded.fetched_at
    `;
    await pool.query(sql, [JSON.stringify(payload)]);
}
