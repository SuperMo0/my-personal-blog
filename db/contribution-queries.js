import pool from './pool.js';

export async function getAllContributions() {
    const sql = `select * from open_source_contributions order by position asc, contributed_at desc`;
    const result = await pool.query(sql);
    return result.rows;
}

export async function getContribution(id) {
    const sql = `select * from open_source_contributions where id=$1`;
    const result = await pool.query(sql, [id]);
    return result.rows[0];
}

export async function insertContribution(contribution) {
    const sql = `
        insert into open_source_contributions (project, title, url, description, contributed_at, position)
        values (
            $1, $2, $3, $4, $5,
            coalesce($6, (select coalesce(max(position), -1) + 1 from open_source_contributions))
        )
        returning *
    `;
    const result = await pool.query(sql, [
        contribution.project,
        contribution.title,
        contribution.url,
        contribution.description || null,
        contribution.contributed_at || null,
        contribution.position ?? null,
    ]);
    return result.rows[0];
}

export async function updateContribution(id, contribution) {
    const fields = [];
    const values = [];
    let queryIndex = 1;

    for (const key of ['project', 'title', 'url', 'description', 'contributed_at', 'position']) {
        if (contribution[key] !== undefined) {
            fields.push(`${key} = $${queryIndex++}`);
            values.push(contribution[key]);
        }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `update open_source_contributions set ${fields.join(', ')} where id = $${queryIndex} returning *`;

    const result = await pool.query(sql, values);
    return result.rows[0] || null;
}

export async function deleteContribution(id) {
    const sql = `delete from open_source_contributions where id=$1`;
    const result = await pool.query(sql, [id]);
    return result.rowCount > 0;
}
