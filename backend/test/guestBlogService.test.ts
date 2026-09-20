import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

// pg-mem doesn't emit real Postgres SQLSTATE codes, so the foreign-key-violation
// translation in guestBlogService can't be exercised through the HTTP integration
// suite in test/app.test.ts. This mocks the repository layer directly instead.
mock.module(new URL('../db/guest-queries.ts', import.meta.url), {
    exports: {
        insertNewComment: async () => {
            throw Object.assign(new Error('insert or update on table "comments" violates foreign key constraint'), {
                code: '23503',
            });
        },
        addLike: async () => undefined,
        removeLike: async () => undefined,
        getAllBlogs: async () => [],
        getBlog: async () => undefined,
        getBlogComments: async () => [],
    },
});

const { addComment, setLike, getPublishedBlog } = await import('../services/guestBlogService.ts');
const { NotFoundError } = await import('../errors.ts');

test('translates a foreign-key violation from commenting on a missing blog into a NotFoundError', async () => {
    await assert.rejects(
        () => addComment('999999', { author_name: 'Visitor', content: 'Hello' }),
        (error: unknown) => error instanceof NotFoundError && error.message === 'Blog not found',
    );
});

test('translates a missing like target into a NotFoundError', async () => {
    await assert.rejects(
        () => setLike('999999', true),
        (error: unknown) => error instanceof NotFoundError && error.message === 'Blog not found',
    );
});

test('translates a missing blog lookup into a NotFoundError', async () => {
    await assert.rejects(
        () => getPublishedBlog('999999'),
        (error: unknown) => error instanceof NotFoundError && error.message === 'Blog not found',
    );
});
