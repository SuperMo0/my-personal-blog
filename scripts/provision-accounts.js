import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import pool from '../db/pool.js';
import { hashPassword } from '../utils/password.js';

const demoDrafts = [
    {
        title: 'Designing a Calm and Useful Writing Dashboard',
        content: `<p>A writing dashboard works best when it keeps the next decision obvious. The draft list should make status, recency, and the available action easy to scan without turning the page into a wall of controls.</p>
<p>This draft explores a small set of interface choices that help writers stay oriented: clear status labels, predictable navigation, and a preview that looks like the published article.</p>`,
    },
    {
        title: 'What I Check Before Shipping a Small Web Feature',
        content: `<p>Small changes deserve a deliberate release check. I start with the user path, verify the unhappy path, and then confirm that authorization is enforced on the server rather than trusted to the interface.</p>
<p>The final pass covers mobile layout, keyboard access, useful error messages, and one focused automated test that proves the feature through its public boundary.</p>`,
    },
];

function readAccountConfiguration(environment) {
    const requiredNames = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'DEMO_EMAIL', 'DEMO_PASSWORD'];
    const missing = requiredNames.filter((name) => !environment[name]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (environment.ADMIN_EMAIL === environment.DEMO_EMAIL) {
        throw new Error('ADMIN_EMAIL and DEMO_EMAIL must be different');
    }

    return {
        admin: {
            name: 'Blog owner',
            email: environment.ADMIN_EMAIL,
            password: environment.ADMIN_PASSWORD,
            role: 'admin',
        },
        viewer: {
            name: 'Demo visitor',
            email: environment.DEMO_EMAIL,
            password: environment.DEMO_PASSWORD,
            role: 'viewer',
        },
    };
}

async function upsertAccount(client, account) {
    const passwordHash = hashPassword(account.password);
    const result = await client.query(
        `insert into users (name, email, password, role)
         values ($1, $2, $3, $4)
         on conflict (email) do update
         set password = excluded.password,
             role = excluded.role
         returning id, email, role`,
        [account.name, account.email, passwordHash, account.role],
    );

    return result.rows[0];
}

async function seedDemoDrafts(client, viewerId) {
    let insertedCount = 0;

    for (const draft of demoDrafts) {
        const result = await client.query(
            `insert into blogs (title, content, author_id, published)
             select $1::varchar(255), $2::varchar(10000), $3::integer, false
             where not exists (
                 select 1
                 from blogs
                 where author_id = $3::integer and title = $1::varchar(255)
             )`,
            [draft.title, draft.content, viewerId],
        );
        insertedCount += result.rowCount;
    }

    return insertedCount;
}

export async function provisionAccounts({ environment = process.env, logger = console } = {}) {
    const accounts = readAccountConfiguration(environment);
    const client = await pool.connect();

    try {
        await client.query('begin');
        const admin = await upsertAccount(client, accounts.admin);
        const viewer = await upsertAccount(client, accounts.viewer);
        const seededDraftCount = await seedDemoDrafts(client, viewer.id);
        const unexpectedUsers = await client.query(
            `select id, email, role
             from users
             where email not in ($1, $2)
             order by id`,
            [accounts.admin.email, accounts.viewer.email],
        );
        await client.query('commit');

        logger.log(`Provisioned ${admin.role} and ${viewer.role} accounts; added ${seededDraftCount} demo drafts.`);
        for (const user of unexpectedUsers.rows) {
            logger.warn('Unexpected user row:', user);
        }

        return { admin, viewer, seededDraftCount, unexpectedUsers: unexpectedUsers.rows };
    } catch (error) {
        await client.query('rollback');
        throw error;
    } finally {
        client.release();
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        await provisionAccounts();
    } catch (error) {
        console.error(`Provisioning failed: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}
