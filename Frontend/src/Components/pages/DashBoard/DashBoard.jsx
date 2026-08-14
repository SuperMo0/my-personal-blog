import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { GoHeart, GoTrash, GoPencil, GoGlobe, GoXCircle } from "react-icons/go";
import api from './../../../utils/Api.js';
import { useAuth } from '../../../Auth/AuthContext.js';

export default function DashBoard() {
    const { session } = useAuth();
    const readOnly = session?.role !== 'admin';
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getArticles() {
            try {
                let [result, ok] = await api('/admin/blogs', {});
                if (ok) setArticles(result.blogs || []);
            } catch {
                console.error("Failed to load articles");
            } finally {
                setLoading(false);
            }
        }
        getArticles();
    }, []);

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this article?")) return;

        const [, ok] = await api(`/admin/blogs/${id}`, { method: 'delete' });
        if (ok) {
            setArticles(articles.filter((a) => a.id !== id));
        }
    }

    async function handleStatus(id, currentStatus) {
        let body = { published: !currentStatus };
        const [, ok] = await api(`/admin/blogs/${id}`, { method: 'put', body: JSON.stringify(body) });

        if (ok) {
            setArticles(articles.map((a) => {
                if (a.id === id) return { ...a, published: !currentStatus };
                return a;
            }));
        }
    }

    if (loading) return <div className="text-center py-20 text-lg">Loading Dashboard...</div>;

    return (
        <div className="wrapper py-10">
            {readOnly && (
                <div role="status" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    Read-only demo — nothing is saved.
                </div>
            )}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your Articles</h1>
                <Link to={'/admin/editor'}>
                    <button className="btn-primary flex items-center gap-2">
                        <GoPencil /> New Article
                    </button>
                </Link>
            </div>

            <div className="bg-(--bg-card) shadow-md rounded-xl overflow-hidden border border-(--border-color)">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-(--bg-primary) border-b border-(--border-color)">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold text-center">Likes</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--border-color)">
                            {articles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-(--text-secondary)">
                                        No articles found. Start writing!
                                    </td>
                                </tr>
                            ) : (
                                articles.map((a) => (
                                    <tr key={a.id} className="hover:bg-(--bg-primary) transition-colors">
                                        <td className="px-6 py-4 font-medium max-w-xs truncate" title={a.title}>
                                            {a.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                onClick={readOnly ? undefined : () => handleStatus(a.id, a.published)}
                                                className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${a.published
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {a.published ? "Published" : "Draft"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-(--text-secondary)">
                                            {new Date(a.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-pink-500 font-medium">
                                                {a.likes} <GoHeart />
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right space-x-2">

                                            <button
                                                onClick={readOnly ? undefined : () => handleStatus(a.id, a.published)}
                                                disabled={readOnly}
                                                className={`p-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${a.published
                                                    ? "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                                    : "text-green-600 hover:text-green-800 hover:bg-green-50"
                                                    }`}
                                                title={readOnly ? 'Unavailable in the read-only demo' : (a.published ? "Unpublish" : "Publish")}
                                            >
                                                {a.published ? <GoXCircle className="w-5 h-5" /> : <GoGlobe className="w-5 h-5" />}
                                            </button>

                                            <Link to={`/admin/editor/${a.id}`}>
                                                <button className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors" title="Edit">
                                                    <GoPencil className="w-5 h-5" />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={readOnly ? undefined : () => handleDelete(a.id)}
                                                disabled={readOnly}
                                                className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={readOnly ? 'Unavailable in the read-only demo' : 'Delete'}
                                            >
                                                <GoTrash className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
