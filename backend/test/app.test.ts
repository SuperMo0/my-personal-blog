import assert from 'node:assert/strict';
import { beforeEach, describe, mock, test } from 'node:test';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { newDb } from 'pg-mem';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.SECRET = 'integration-test-secret';
process.env.DEMO_EMAIL = 'demo@example.com';
const SECRET = process.env.SECRET;

function decodeSessionToken(token: string) {
    return jwt.verify(token, SECRET) as jwt.JwtPayload & { id: number; email: string; role: string };
}

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
    create table open_source_contributions (
        id serial primary key,
        project varchar(255) not null,
        title varchar(255) not null,
        url varchar(500) not null,
        description varchar(500),
        contributed_at date,
        position integer not null default 0,
        created_at timestamp default now()
    );
    create table github_activity_snapshot (
        id integer primary key default 1,
        payload jsonb not null,
        fetched_at timestamp not null default now()
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
    await testPool.query('delete from open_source_contributions');
    await testPool.query('delete from github_activity_snapshot');
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

const { createApp, default: app } = await import('../app.ts');

const githubRepositories = [
    'SuperMo0/movies-club',
    'SuperMo0/my-chatting-app',
    'sync-ngo-sy/sync-hub-v2',
    'SuperMo0/my-personal-blog',
    'SuperMo0/ai-engineering-curriculum',
    'SuperMo0/multi-model-ai-assistant',
    'SuperMo0/langgraph-automated-research-agent',
];

interface RepositoryFigure {
    commits: number;
    lastActivityAt: string;
    stars?: number;
}

interface CalendarDay {
    date: string;
    count: number;
}

function githubResponse(commitCount: number, latestAuthoredCommitAt: string): Response {
    const headers: Record<string, string> = { 'content-type': 'application/json' };

    if (commitCount > 1) {
        headers.link = `<https://api.github.com/repositories/1/commits?per_page=1&page=${commitCount}>; rel="last"`;
    }

    const commits =
        commitCount === 0
            ? []
            : [
                  {
                      commit: { author: { date: latestAuthoredCommitAt } },
                  },
              ];
    return new Response(JSON.stringify(commits), { status: 200, headers });
}

function graphQLCalendarResponse(days: CalendarDay[]): Response {
    return new Response(
        JSON.stringify({
            data: {
                user: {
                    contributionsCollection: {
                        contributionCalendar: {
                            totalContributions: days.reduce((total, day) => total + day.count, 0),
                            weeks: [
                                {
                                    contributionDays: days.map((day) => ({
                                        date: day.date,
                                        contributionCount: day.count,
                                    })),
                                },
                            ],
                        },
                    },
                },
            },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
    );
}

function createGitHubFetch(
    figures: Record<string, RepositoryFigure>,
    { calendarDays, calendarResponse }: { calendarDays?: CalendarDay[]; calendarResponse?: Response } = {},
) {
    return async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
        const requestUrl = new URL(url as string | URL);
        const headers = options?.headers as Record<string, string> | undefined;
        const hasServerToken = headers?.Authorization === 'Bearer server-only-test-token';

        if (!hasServerToken) {
            return new Response(JSON.stringify({ message: 'unauthorized' }), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            });
        }

        if (requestUrl.pathname === '/graphql') {
            if (calendarResponse) return calendarResponse;
            return graphQLCalendarResponse(calendarDays ?? []);
        }

        const repository = githubRepositories.find((name) => requestUrl.pathname.includes(`/repos/${name}`));
        const isCommitsRequest = requestUrl.pathname.endsWith('/commits');
        const isAuthoredRequest = !isCommitsRequest || requestUrl.searchParams.get('author') === 'SuperMo0';

        if (!isAuthoredRequest) {
            return new Response(JSON.stringify({ message: 'unauthorized' }), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            });
        }

        const figure = figures[repository as string];

        return isCommitsRequest
            ? githubResponse(figure.commits, '2025-01-01T12:00:00Z')
            : new Response(JSON.stringify({ pushed_at: figure.lastActivityAt, stargazers_count: figure.stars ?? 0 }), {
                  status: 200,
                  headers: { 'content-type': 'application/json' },
              });
    };
}

async function login(email: string, password: string, extraBody: Record<string, unknown> = {}) {
    return request(app)
        .post('/api/admin/login')
        .send({ email, password, ...extraBody });
}

function authenticated(method: 'get' | 'post' | 'put' | 'delete', path: string, token: string) {
    return request(app)[method](path).set('authorization', `Bearer ${token}`);
}

describe('read-only demo access', () => {
    beforeEach(resetDatabase);

    test('the configured Express app can be driven over HTTP without listening', async () => {
        const response = await request(app).get('/api/blogs');

        assert.equal(response.status, 200);
        assert.deepEqual(
            response.body.blogs.map((blog: { title: string }) => blog.title),
            ['Published guide'],
        );
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
        const payload = decodeSessionToken(response.body.token);

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
        const payload = decodeSessionToken(response.body.token);

        assert.equal(response.status, 200);
        assert.equal(payload.email, 'demo@example.com');
        assert.equal(payload.role, 'viewer');
    });

    test('uses the dedicated demo address when no runtime override is configured', async () => {
        await testPool.query("update users set email = 'demo@my-personal-blog.local' where id = 200");
        const configuredDemoEmail = process.env.DEMO_EMAIL;
        delete process.env.DEMO_EMAIL;

        try {
            const response = await request(app).post('/api/admin/demo-login');
            const payload = decodeSessionToken(response.body.token);

            assert.equal(response.status, 200);
            assert.equal(payload.email, 'demo@my-personal-blog.local');
            assert.equal(payload.role, 'viewer');
        } finally {
            process.env.DEMO_EMAIL = configuredDemoEmail;
        }
    });

    test('lets a viewer read visible articles and comments', async () => {
        const {
            body: { token },
        } = await login('demo@example.com', viewerPassword);

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
        const {
            body: { token },
        } = await login('demo@example.com', viewerPassword);

        const list = await authenticated('get', '/api/admin/blogs', token);
        const ownerDraft = await authenticated('get', '/api/admin/blogs/102', token);
        const titles = list.body.blogs.map((blog: { title: string }) => blog.title);

        assert.equal(list.status, 200);
        assert.deepEqual(
            new Set(titles),
            new Set([
                'Published guide',
                'Planning an accessible design review',
                'A practical checklist for resilient APIs',
            ]),
        );
        assert.equal(ownerDraft.status, 404);
    });

    test('shows an admin every article', async () => {
        const {
            body: { token },
        } = await login('owner@example.com', adminPassword);

        const response = await authenticated('get', '/api/admin/blogs', token);

        assert.equal(response.status, 200);
        assert.deepEqual(
            new Set(response.body.blogs.map((blog: { title: string }) => blog.title)),
            new Set([
                'Published guide',
                'Owner private notes',
                'Planning an accessible design review',
                'A practical checklist for resilient APIs',
            ]),
        );
    });

    test('refuses every viewer mutation with a read-only demo message', async () => {
        const {
            body: { token },
        } = await login('demo@example.com', viewerPassword);
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
        const {
            body: { token },
        } = await login('owner@example.com', adminPassword);

        const created = await authenticated('post', '/api/admin/blogs', token).send({
            title: 'New article',
            content: '<p>First version</p>',
        });
        assert.equal(created.status, 201);

        let list = await authenticated('get', '/api/admin/blogs', token);
        const newArticle = list.body.blogs.find((blog: { id: number; title: string }) => blog.title === 'New article');
        assert.ok(newArticle);

        const edited = await authenticated('put', `/api/admin/blogs/${newArticle.id}`, token).send({
            title: 'Edited article',
        });
        assert.equal(edited.status, 200);

        const published = await authenticated('put', `/api/admin/blogs/${newArticle.id}`, token).send({
            published: true,
        });
        assert.equal(published.status, 200);

        const article = await authenticated('get', `/api/admin/blogs/${newArticle.id}`, token);
        assert.equal(article.body.blog.title, 'Edited article');
        assert.equal(article.body.blog.published, true);

        const deleted = await authenticated('delete', `/api/admin/blogs/${newArticle.id}`, token);
        assert.equal(deleted.status, 200);

        list = await authenticated('get', '/api/admin/blogs', token);
        assert.equal(
            list.body.blogs.some((blog: { id: number }) => blog.id === newArticle.id),
            false,
        );
    });

    test('refuses missing, malformed, wrongly formatted, and expired tokens', async () => {
        const expiredToken = jwt.sign({ id: 100, email: 'owner@example.com', role: 'admin' }, SECRET, {
            algorithm: 'HS256',
            expiresIn: -1,
        });

        const missing = await request(app).get('/api/admin/blogs');
        const malformed = await authenticated('get', '/api/admin/blogs', 'not-a-token');
        const {
            body: { token },
        } = await login('owner@example.com', adminPassword);
        const wrongScheme = await request(app).get('/api/admin/blogs').set('authorization', `Basic ${token}`);
        const expired = await authenticated('get', '/api/admin/blogs', expiredToken);

        assert.equal(missing.status, 401);
        assert.equal(malformed.status, 403);
        assert.equal(wrongScheme.status, 403);
        assert.equal(expired.status, 403);
    });
});

describe('GitHub activity', () => {
    beforeEach(() => testPool.query('delete from github_activity_snapshot'));

    test('returns authored figures for the seven projects and serves a second request from cache', async () => {
        const initialFigures = Object.fromEntries(
            githubRepositories.map((repository, index) => [
                repository,
                {
                    commits: index + 2,
                    lastActivityAt: `2026-08-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
                },
            ]),
        );
        const changedFigures = Object.fromEntries(
            githubRepositories.map((repository) => [
                repository,
                { commits: 99, lastActivityAt: '2026-09-01T12:00:00Z' },
            ]),
        );
        let shouldUseInitialFigures = true;
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: (...args) =>
                createGitHubFetch(shouldUseInitialFigures ? initialFigures : changedFigures)(...args),
        });

        const first = await request(activityApp).get('/api/github-activity');
        shouldUseInitialFigures = false;
        const second = await request(activityApp).get('/api/github-activity');

        assert.equal(first.status, 200);
        assert.equal(first.body.author, 'SuperMo0');
        assert.equal(first.body.totalCommits, 35);
        assert.deepEqual(
            first.body.projects.map(
                ({
                    repository,
                    commits,
                    lastActivityAt,
                }: {
                    repository: string;
                    commits: number;
                    lastActivityAt: string;
                }) => ({
                    repository,
                    commits,
                    lastActivityAt,
                }),
            ),
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

    test('includes the live contribution calendar alongside per-project figures', async () => {
        const figures = Object.fromEntries(
            githubRepositories.map((repository) => [
                repository,
                { commits: 1, lastActivityAt: '2026-08-01T12:00:00Z' },
            ]),
        );
        const calendarDays = [
            { date: '2026-08-18', count: 3 },
            { date: '2026-08-19', count: 0 },
        ];
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: createGitHubFetch(figures, { calendarDays }),
        });

        const response = await request(activityApp).get('/api/github-activity');

        assert.equal(response.status, 200);
        assert.deepEqual(response.body.contributionCalendar, {
            totalContributions: 3,
            days: calendarDays,
        });
    });

    test('degrades the calendar to null without failing the rest of the response', async () => {
        const figures = Object.fromEntries(
            githubRepositories.map((repository) => [
                repository,
                { commits: 1, lastActivityAt: '2026-08-01T12:00:00Z' },
            ]),
        );
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: createGitHubFetch(figures, {
                calendarResponse: new Response('not json', { status: 500 }),
            }),
        });

        const response = await request(activityApp).get('/api/github-activity');

        assert.equal(response.status, 200);
        assert.equal(response.body.contributionCalendar, null);
        assert.equal(response.body.totalCommits, githubRepositories.length);
    });

    test('reports a star count per project, defaulting to zero when GitHub omits it', async () => {
        const figures = Object.fromEntries(
            githubRepositories.map((repository, index) => [
                repository,
                { commits: 1, lastActivityAt: '2026-08-01T12:00:00Z', stars: index === 0 ? 7 : undefined },
            ]),
        );
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: createGitHubFetch(figures),
        });

        const response = await request(activityApp).get('/api/github-activity');

        assert.equal(response.status, 200);
        assert.equal(response.body.projects[0].stars, 7);
        assert.equal(response.body.projects[1].stars, 0);
    });

    test('returns an unavailable response when GitHub fails with a cold cache', async () => {
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: async () =>
                new Response(JSON.stringify({ message: 'upstream unavailable' }), {
                    status: 503,
                    headers: { 'content-type': 'application/json' },
                }),
        });

        const response = await request(activityApp).get('/api/github-activity');

        assert.equal(response.status, 503);
        assert.deepEqual(response.body, { message: 'GitHub activity is temporarily unavailable' });
    });

    test('returns an unavailable response when GitHub does not respond', async () => {
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubRequestTimeoutMs: 10,
            githubFetch: async (_url: string | URL | Request, init?: RequestInit): Promise<Response> =>
                new Promise((_resolve, reject) => {
                    const signal = init?.signal;
                    signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
                }),
        });

        const response = await request(activityApp).get('/api/github-activity');

        assert.equal(response.status, 503);
        assert.deepEqual(response.body, { message: 'GitHub activity is temporarily unavailable' });
    });

    test('serves the last saved snapshot when GitHub fails after a prior success', async () => {
        const figures = Object.fromEntries(
            githubRepositories.map((repository) => [
                repository,
                { commits: 3, lastActivityAt: '2026-08-01T12:00:00Z' },
            ]),
        );

        // A first app instance fetches successfully and persists a snapshot to the (shared) database.
        const firstApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: createGitHubFetch(figures),
        });
        const first = await request(firstApp).get('/api/github-activity');
        assert.equal(first.status, 200);
        assert.equal(first.body.stale, undefined);

        // A second, cold app instance can't reach GitHub, but shares the same database snapshot.
        const secondApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: async () => new Response('down', { status: 503 }),
        });
        const second = await request(secondApp).get('/api/github-activity');

        assert.equal(second.status, 200);
        assert.equal(second.body.stale, true);
        assert.equal(second.body.totalCommits, first.body.totalCommits);
    });

    test('still returns unavailable when GitHub fails and no snapshot was ever saved', async () => {
        const activityApp = createApp({
            githubToken: 'server-only-test-token',
            githubFetch: async () => new Response('down', { status: 503 }),
        });

        const response = await request(activityApp).get('/api/github-activity');

        assert.equal(response.status, 503);
    });
});

describe('Open source contributions', () => {
    beforeEach(resetDatabase);

    async function seedContribution(overrides = {}) {
        const {
            body: { token },
        } = await login('owner@example.com', adminPassword);
        const {
            body: { contribution },
        } = await authenticated('post', '/api/admin/contributions', token).send({
            project: 'nodejs/node',
            title: 'doc: fix a typo',
            url: 'https://github.com/nodejs/node/pull/1',
            ...overrides,
        });
        return contribution;
    }

    test('is empty by default and lists what the owner adds, publicly and without auth', async () => {
        const empty = await request(app).get('/api/open-source-contributions');
        assert.deepEqual(empty.body.contributions, []);

        const contribution = await seedContribution();

        const populated = await request(app).get('/api/open-source-contributions');
        assert.equal(populated.status, 200);
        assert.equal(populated.body.contributions.length, 1);
        assert.equal(populated.body.contributions[0].id, contribution.id);
        assert.equal(populated.body.contributions[0].project, 'nodejs/node');
    });

    test('requires a project, title, and url to create one', async () => {
        const {
            body: { token },
        } = await login('owner@example.com', adminPassword);

        const response = await authenticated('post', '/api/admin/contributions', token).send({
            project: 'nodejs/node',
        });

        assert.equal(response.status, 400);
    });

    test('refuses a viewer write with the read-only demo message, but still lets them read', async () => {
        const {
            body: { token },
        } = await login('demo@example.com', viewerPassword);

        const created = await authenticated('post', '/api/admin/contributions', token).send({
            project: 'nodejs/node',
            title: 'doc: fix a typo',
            url: 'https://github.com/nodejs/node/pull/1',
        });
        assert.equal(created.status, 403);
        assert.match(created.body.message, /read-only demo/i);

        const list = await authenticated('get', '/api/admin/contributions', token);
        assert.equal(list.status, 200);
    });

    test('lets an admin edit and delete a contribution', async () => {
        const contribution = await seedContribution();
        const {
            body: { token },
        } = await login('owner@example.com', adminPassword);

        const edited = await authenticated('put', `/api/admin/contributions/${contribution.id}`, token).send({
            description: 'Fixed a typo in the docs',
        });
        assert.equal(edited.status, 200);
        assert.equal(edited.body.contribution.description, 'Fixed a typo in the docs');

        const deleted = await authenticated('delete', `/api/admin/contributions/${contribution.id}`, token);
        assert.equal(deleted.status, 200);

        const list = await request(app).get('/api/open-source-contributions');
        assert.deepEqual(list.body.contributions, []);
    });
});

describe('Guest comments and likes', () => {
    beforeEach(resetDatabase);

    test('lets a visitor comment on a published article', async () => {
        const response = await request(app)
            .post('/api/blogs/101')
            .send({ author_name: 'Visitor', content: 'Great read!' });

        assert.equal(response.status, 201);
        assert.equal(response.body.comment.author_name, 'Visitor');
        assert.equal(response.body.comment.content, 'Great read!');

        const comments = await request(app).get('/api/blogs/101/comments');
        assert.ok(comments.body.comments.some((comment: { content: string }) => comment.content === 'Great read!'));
    });

    test('rejects a comment missing required fields', async () => {
        const response = await request(app).post('/api/blogs/101').send({ author_name: 'Visitor' });

        assert.equal(response.status, 400);
        assert.equal(response.body.message, 'Validation failed');
    });

    // Commenting on a missing blog id (a foreign-key violation) is covered in
    // test/guestBlogService.test.ts instead: pg-mem doesn't emit real Postgres
    // SQLSTATE codes, so that translation can't be exercised over HTTP here.

    test('lets a visitor like and unlike a published article', async () => {
        const liked = await request(app).post('/api/blogs/101/like').send({ liked: true });
        assert.equal(liked.status, 200);
        assert.equal(liked.body.likes, 1);

        const unliked = await request(app).post('/api/blogs/101/like').send({ liked: false });
        assert.equal(unliked.status, 200);
        assert.equal(unliked.body.likes, 0);
    });

    test('rejects a like request without a boolean liked flag', async () => {
        const response = await request(app).post('/api/blogs/101/like').send({});

        assert.equal(response.status, 400);
        assert.equal(response.body.message, 'Validation failed');
    });

    test('reports liking a missing article as not found', async () => {
        const response = await request(app).post('/api/blogs/999999/like').send({ liked: true });

        assert.equal(response.status, 404);
        assert.deepEqual(response.body, { message: 'Blog not found' });
    });
});

describe('Rate limiting on public write endpoints', () => {
    beforeEach(resetDatabase);

    test('throttles repeated comment submissions from the same visitor', async () => {
        const limitedApp = createApp({
            commentRateLimit: { windowMs: 60_000, limit: 2 },
        });

        const first = await request(limitedApp).post('/api/blogs/101').send({ author_name: 'A', content: 'One' });
        const second = await request(limitedApp).post('/api/blogs/101').send({ author_name: 'B', content: 'Two' });
        const third = await request(limitedApp).post('/api/blogs/101').send({ author_name: 'C', content: 'Three' });

        assert.equal(first.status, 201);
        assert.equal(second.status, 201);
        assert.equal(third.status, 429);
        assert.deepEqual(third.body, { message: 'Too many requests, please try again later.' });
    });

    test('throttles repeated like submissions from the same visitor', async () => {
        const limitedApp = createApp({
            likeRateLimit: { windowMs: 60_000, limit: 2 },
        });

        const first = await request(limitedApp).post('/api/blogs/101/like').send({ liked: true });
        const second = await request(limitedApp).post('/api/blogs/101/like').send({ liked: false });
        const third = await request(limitedApp).post('/api/blogs/101/like').send({ liked: true });

        assert.equal(first.status, 200);
        assert.equal(second.status, 200);
        assert.equal(third.status, 429);
        assert.deepEqual(third.body, { message: 'Too many requests, please try again later.' });
    });
});

describe('Request validation', () => {
    beforeEach(resetDatabase);

    test('rejects a non-numeric blog id with a structured validation error', async () => {
        const {
            body: { token },
        } = await login('owner@example.com', adminPassword);

        const response = await authenticated('get', '/api/admin/blogs/not-a-number', token);

        assert.equal(response.status, 400);
        assert.equal(response.body.message, 'Validation failed');
        assert.ok(Array.isArray(response.body.errors));
    });

    test('rejects an admin blog creation missing required fields', async () => {
        const {
            body: { token },
        } = await login('owner@example.com', adminPassword);

        const response = await authenticated('post', '/api/admin/blogs', token).send({ title: 'Only a title' });

        assert.equal(response.status, 400);
        assert.equal(response.body.message, 'Validation failed');
    });
});

describe('CORS', () => {
    test('allows the production site origin', async () => {
        const response = await request(app).get('/api/blogs').set('Origin', 'https://mwafak.dev');

        assert.equal(response.headers['access-control-allow-origin'], 'https://mwafak.dev');
    });

    test('does not echo back an untrusted origin', async () => {
        const response = await request(app).get('/api/blogs').set('Origin', 'https://evil.example');

        assert.equal(response.headers['access-control-allow-origin'], undefined);
    });
});
