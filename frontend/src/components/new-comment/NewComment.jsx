import React, { useState } from 'react';
import api from './../../utils/Api.js';

export default function NewComment({ id, handleAddComment }) {
    const [loading, setLoading] = useState(false);

    async function handleNewComment(e) {
        e.preventDefault();
        setLoading(true);

        const form = e.target;
        const data = Object.fromEntries(new FormData(form));

        try {
            let [result, ok] = await api(`/blogs/${id}`, { method: 'post', body: JSON.stringify(data) });
            if (ok) {
                handleAddComment(result.comment);
                form.reset();
            }
        } catch (e) {
            console.error("Comment failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleNewComment} className="bg-(--bg-card) p-6 rounded-xl border border-(--border-color)">
            <h4 className="font-bold mb-4">Leave a reply</h4>
            <div className="grid gap-4">
                <input
                    name='author_name'
                    required
                    className="input-field"
                    type="text"
                    placeholder="Your Name"
                />
                <textarea
                    name='content'
                    required
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Share your thoughts..."
                />
                <button
                    type='submit'
                    disabled={loading}
                    className="btn-primary self-end"
                >
                    {loading ? 'Posting...' : 'Post Comment'}
                </button>
            </div>
        </form>
    );
}