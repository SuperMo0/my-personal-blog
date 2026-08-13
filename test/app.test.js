import assert from 'node:assert/strict';
import { beforeEach, describe, mock, test } from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { newDb } from 'pg-mem';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.SECRET = 'integration-test-secret';
process.env.DEMO_EMAIL = 'demo@example.com';

const database = newDb({ autoCreateForeignKeyIndices: true });
const postgresAdapter = database.adapters.createPg();

mock.module('pg', {
    defaultExport: postgresAdapter,
    namedExports: postgresAdapter,
});

const testPool = new postgresAdapter.Pool();

await testPool.query(`
    create table users (
        id serial primary key,
        name varchar(255) not null,
        email varchar(255) not null unique,
        password varchar(255) not null,
        role varchar(20) not null default 'viewer'
    );
    create table blogs (
        id serial primary key,
        title varchar(255) not null,
        content varchar(10000) not null,
        author_id integer not null references users(id),
        created_at timestamp default now(),
        likes integer default 0,
        published boolean not null default false
    );
    create table comments (
        id serial primary key,
        author_name varchar(255) not null,
        content varchar(1000) not null,
        blog_id integer not null references blogs(id) on delete cascade,
        created_at timestamp default now()
    );
`);

const adminPassword = 'correct admin password';
const viewerPassword = 'correct viewer password';
const adminHash = await bcrypt.hash(adminPassword, 4);
const viewerHash = await bcrypt.hash(viewerPassword, 4);

async function resetDatabase() {
    await testPool.query('delete from comments');
    await testPool.query('delete from blogs');
    await testPool.query('delete from users');
    await testPool.query(
        `insert into users (id, name, email, password, role)
         values (100, 'Owner', 'owner@example.com', $1, 'admin'),
                (200, 'Demo visitor', 'demo@example.com', $2, 'viewer')`,
        [adminHash, viewerHash],
    );
    await testPool.query(
        `insert into blogs (id, title, content, author_id, published)
         values (101, 'Published guide', '<p>Public</p>', 100, true),
                (102, 'Owner private notes', '<p>Private</p>', 100, false),
                (103, 'Planning an accessible design review', '<p>Demo draft one</p>', 200, false),
                (104, 'A practical checklist for resilient APIs', '<p>Demo draft two</p>', 200, false)`,
    );
    await testPool.query(
        `insert into comments (author_name, content, blog_id)
         values ('Reader', 'Useful article', 101)`,
    );
}

const { createApp, default: app } = await import('../app.js');

const githubRepositories = [
    'SuperMo0/movies-club',
    'SuperMo0/my-chatting-app',
    'sync-ngo-sy/sync-hub-v2',
    'SuperMo0/my-personal-blog',
    'SuperMo0/ai-engineering-curriculum',
    'SuperMo0/multi-model-ai-assistant',
    'SuperMo0/langgraph-automated-research-agent',
];

function githubResponse(commitCount, latestAuthoredCommitAt) {
    const headers = { 'content-type': 'application/json' };

    if (commitCount > 1) {
        headers.link = `<https://api.github.com/repositories/1/commits?per_page=1&page=${commitCount}>; rel="last"`;
    }

    const commits = commitCount === 0 ? [] : [{
        commit: { author: { date: latestAuthoredCommitAt } },
    }];
    return new Response(JSON.stringify(commits), { status: 200, headers });
}

function createGitHubFetch(figures) {
    return async (url, options) => {
        const requestUrl = new URL(url);
        const repository = githubRepositories.find((name) => requestUrl.pathname.includes(`/repos/${name}`));
        const isCommitsRequest = requestUrl.pathname.endsWith('/commits');
        const isAuthoredRequest = !isCommitsRequest || requestUrl.searchParams.get('author') === 'SuperMo0';
        const hasServerToken = options?.headers?.Authorization === 'Bearer server-only-test-token';

        if (!isAuthoredRequest || !hasServerToken) {
            return new Response(JSON.stringify({ message: 'unauthorized' }), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            });
        }

        const figure = figures[repository];

        return isCommitsRequest
            ? githubResponse(figure.commits, '2025-01-01T12:00:00Z')
            : new Response(JSON.stringify({ pushed_at: figure.lastActivityAt }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            });
    };
}

async function login(email, password, extraBody = {}) {
    return request(app)
        .post('/api/admin/login')
        .send({ email, password, ...extraBody });
}

function authenticated(method, path, token) {
    return request(app)[method](path).set('authorization', `Bearer ${token}`);
}

describe('read-only demo access', () => {
    beforeEach(resetDatabase);

    test('the configured Express app can be driven over HTTP without listening', async () => {
        const response = await request(app).get('/api/blogs');

        assert.equal(response.status, 200);
        assert.deepEqual(response.body.blogs.map((blog) => blog.title), ['Published guide']);
    });

    test('accepts correct passwords and rejects incorrect passwords for both roles', async () => {
        const adminSuccess = await login('owner@example.com', adminPassword);
        const viewerSuccess = await login('demo@example.com', viewerPassword);
        const adminFailure = await login('owner@example.com', 'incorrect');
        const viewerFailure = await login('demo@example.com', 'incorrect');

        assert.equal(adminSuccess.status, 200);
        assert.equal(typeof adminSuccess.body.token, 'string');
        assert.equal(viewerSuccess.status, 200);
        assert.equal(typeof viewerSuccess.body.token, 'string');
        assert.equal(adminFailure.status, 401);
        assert.deepEqual(adminFailure.body, { message: 'Invalid email or password' });
        assert.equal(viewerFailure.status, 401);
        assert.deepEqual(viewerFailure.body, { message: 'Invalid email or password' });
    });

    test('rejects the stored bcrypt hash when it is submitted as the password', async () => {
        const response = await login('owner@example.com', adminHash);

        assert.equal(response.status, 401);
        assert.deepEqual(response.body, { message: 'Invalid email or password' });
    });

    test('puts the database role in the token and ignores request-supplied roles', async () => {
        const response = await login('demo@example.com', viewerPassword, { role: 'admin' });
        const payload = jwt.verify(response.body.token, process.env.SECRET);

        assert.equal(response.status, 200);
        assert.equal(payload.role, 'viewer');
        assert.equal(payload.email, 'demo@example.com');
        assert.equal('admin' in payload, false);
    });

    test('refuses login when an account has a role outside admin and viewer', async () => {
        await testPool.query("update users set role = 'editor' where email = 'owner@example.com'");

        const response = await login('owner@example.com', adminPassword);

        assert.equal(response.status, 401);
        assert.deepEqual(response.body, { message: 'Invalid email or password' });
    });

    test('provides one-click entry for the configured demo account', async () => {
        const response = await request(app)
            .post('/api/admin/demo-login')
            .send({ email: 'owner@example.com', role: 'admin' });
        const payload = jwt.verify(response.body.token, process.env.SECRET);

        assert.equal(response.status, 200);
        assert.equal(payload.email, 'demo@example.com');
        assert.equal(payload.role, 'viewer');
    });

    test('uses the dedicated demo address when no runtime override is configured', async () => {
        await testPool.query(
            "update users set email = 'demo@my-personal-blog.local' where id = 200",
        );
        const configuredDemoEmail = process.env.DEMO_EMAIL;
        delete process.env.DEMO_EMAIL;

        try {
            const response = await request(app).post('/api/admin/demo-login');
            const payload = jwt.verify(response.body.token, process.env.SECRET);

            assert.equal(response.status, 200);
            assert.equal(payload.email, 'demo@my-personal-blog.local');
            assert.equal(payload.role, 'viewer');
        } finally {
            process.env.DEMO_EMAIL = configuredDemoEmail;
        }
    });

    test('lets a viewer read visible articles and comments', async () => {
        const { body: { token } } = await login('demo@example.com', viewerPassword);

        const list = await authenticated('get', '/api/admin/blogs', token);
        const article = await authenticated('get', '/api/admin/blogs/103', token);
        const comments = await authenticated('get', '/api/admin/blogs/101/comments', token);

        assert.equal(list.status, 200);
        assert.equal(article.status, 200);
        assert.equal(article.body.blog.title, 'Planning an accessible design review');
        assert.equal(comments.status, 200);
        assert.equal(comments.body.comments[0].content, 'Useful article');
    });

    test('shows a viewer published articles and demo drafts, but never the owner draft', async () => {
        const { body: { token } } = await login('demo@example.com', viewerPassword);

        const list = await authenticated('get', '/api/admin/blogs', token);
        const ownerDraft = await authenticated('get', '/api/admin/blogs/102', token);
        const titles = list.body.blogs.map((blog) => blog.title);

        assert.equal(list.status, 200);
        assert.deepEqual(new Set(titles), new Set([
            'Published guide',
            'Planning an accessible design review',
            'A practical checklist for resilient APIs',
        ]));
        assert.equal(ownerDraft.status, 404);
    });

    test('shows an admin every article', async () => {
        const { body: { token } } = await login('owner@example.com', adminPassword);

        const response = await authenticated('get', '/api/admin/blogs', token);

        assert.equal(response.status, 200);
        assert.deepEqual(
            new Set(response.body.blogs.map((blog) => blog.title)),
            new Set([
                'Published guide',
                'Owner private notes',
                'Planning an accessible design review',
                'A practical checklist for resilient APIs',
            ]),
        );
    });

    test('refuses every viewer mutation with a read-only demo message', async () => {
        const { body: { token } } = await login('demo@example.com', viewerPassword);
        const mutations = [
            authenticated('post', '/api/admin/blogs', token).send({ title: 'New', content: 'Body' }),
            authenticated('put', '/api/admin/blogs/103', token).send({ title: 'Changed' }),
            authenticated('put', '/api/admin/blogs/103', token).send({ published: true }),
            authenticated('delete', '/api/admin/blogs/103', token),
        ];

        const responses = await Promise.all(mutations);

        for (const response of responses) {
            assert.equal(response.status, 403);
            assert.match(response.body.message, /read-only demo/i);
        }
    });

    test('lets an admin create, edit, publish, and delete articles', async () => {
        const { body: { token } } = await login('owner@example.com', adminPassword);

        const created = await authenticated('post', '/api/admin/blogs', token)
            .send({ title: 'New article', content: '<p>First version</p>' });
        assert.equal(created.status, 201);

        let list = await authenticated('get', '/api/admin/blogs', token);
        const newArticle = list.body.blogs.find((blog) => blog.title === 'New article');
        assert.ok(newArticle);

        const edited = await authenticated('put', `/api/admin/blogs/${newArticle.id}`, token)
            .send({ title: 'Edited article' });
        assert.equal(edited.status, 200);

        const published = await authenticated('put', `/api/admin/blogs/${newArticle.id}`, token)
            .send({ published: true });
        assert.equal(published.status, 200);

        const article = await authenticated('get', `/api/admin/blogs/${newArticle.id}`, token);
        assert.equal(article.body.blog.title, 'Edited article');
        assert.equal(article.body.blog.published, true);

        const deleted = await authenticated('delete', `/api/admin/blogs/${newArticle.id}`, token);
        assert.equal(deleted.status, 200);

        list = await authenticated('get', '/api/admin/blogs', token);
        assert.equal(list.body.blogs.some((blog) => blog.id === newArticle.id), false);
    });

    test('refuses missing, malformed, wrongly formatted, and expired tokens', async () => {
        const expiredToken = jwt.sign(
            { id: 100, email: 'owner@example.com', role: 'admin' },
            process.env.SECRET,
            { algorithm: 'HS256', expiresIn: -1 },
        );

        const missing = await request(app).get('/api/admin/blogs');
        const malformed = await authenticated('get', '/api/admin/blogs', 'not-a-token');
        const { body: { token } } = await login('owner@example.com', adminPassword);
        const wrongScheme = await request(app)
            .get('/api/admin/blogs')
            .set('authorization', `Basic ${token}`);
        const expired = await authenticated('get', '/api/admin/blogs', expiredToken);

        assert.equal(missing.status, 401);
        assert.equal(malformed.status, 403);
        assert.equal(wrongScheme.status, 403);
        assert.equal(expired.status, 403);
    });
});

describe('GitHub activity', () => {
    test('returns authored figures for the seven projects and serves a second request from cache', async () => {
        const initialFigures = Object.fromEntries(githubRepositories.map((repository, index) => [
            repository,
            {
                commits: index + 2,
                lastActivityAt: `2026-08-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
            },
        ]));
        const changedFigures = Object.fromEntries(githubRepositories.map((repository) => [
            repository,
            { commits: 99, lastActivityAt: '2026-09-01T12:00:00Z' },
        ]));
        let shouldUseInitialFigures = true;
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: (...args) => createGitHubFetch(
                shouldUseInitialFigures ? initialFigures : changedFigures,
            )(...args),
        });

        const first = await request(activityApp).get('/api/github-activity');
        shouldUseInitialFigures = false;
        const second = await request(activityApp).get('/api/github-activity');

        assert.equal(first.status, 200);
        assert.equal(first.body.author, 'SuperMo0');
        assert.equal(first.body.totalCommits, 35);
        assert.deepEqual(
            first.body.projects.map(({ repository, commits, lastActivityAt }) => ({
                repository,
                commits,
                lastActivityAt,
            })),
            githubRepositories.map((repository, index) => ({
                repository,
                commits: index + 2,
                lastActivityAt: `2026-08-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
            })),
        );
        assert.equal(second.status, 200);
        assert.deepEqual(second.body, first.body);
        assert.equal(JSON.stringify(first.body).includes('server-only-test-token'), false);
    });

    test('returns an unavailable response when GitHub fails with a cold cache', async () => {
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: async () => new Response(
                JSON.stringify({ message: 'upstream unavailable' }),
                { status: 503, headers: { 'content-type': 'application/json' } },
            ),
        });

        const response = await request(activityApp).get('/api/github-activity');

        assert.equal(response.status, 503);
        assert.deepEqual(response.body, { message: 'GitHub activity is temporarily unavailable' });
    });

    test('returns an unavailable response when GitHub does not respond', async () => {
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubRequestTimeoutMs: 10,
            githubFetch: async (url, { signal }) => new Promise((resolve, reject) => {
                signal.addEventListener('abort', () => reject(signal.reason), { once: true });
            }),
        });

        const response = await request(activityApp).get('/api/github-activity');

        assert.equal(response.status, 503);
        assert.deepEqual(response.body, { message: 'GitHub activity is temporarily unavailable' });
    });
});
