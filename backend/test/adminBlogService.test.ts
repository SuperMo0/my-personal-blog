import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

// Same rationale as test/guestBlogService.test.ts: pg-mem doesn't emit real
// Postgres SQLSTATE codes, so this repository-layer error translation is
// mocked directly rather than exercised through the HTTP integration suite.
mock.module(new URL('../db/admin-queries.ts', import.meta.url), {
    exports: {
        deleteBlog: async () => {
            throw Object.assign(new Error('update or delete on table "blogs" violates foreign key constraint'), {
                code: '23503',
            });
        },
        getAllBlogs: async () => [],
        getBlog: async () => undefined,
        getAllBlogComments: async () => [],
        getAllComments: async () => [],
        getUserByEmail: async () => undefined,
        insertBlog: async () => ({ id: 1, title: '', created_at: '' }),
        updateBlog: async () => false,
    },
});

const { deleteBlog } = await import('../services/adminBlogService.ts');
const { ConflictError } = await import('../errors.ts');

test('translates a foreign-key violation from deleting a blog with related data into a ConflictError', async () => {
    await assert.rejects(
        () => deleteBlog('1'),
        (error: unknown) =>
            error instanceof ConflictError && error.message === 'Cannot delete blog because it has related data',
    );
});
