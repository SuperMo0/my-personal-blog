import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { GoEye } from "react-icons/go";
import MyEditor from '../../Editor/Editor';
import api from './../../../utils/Api.js';
import Notification from '../../Notification/Notification.jsx';
import Article from '../Article/Article.jsx';
import { useAuth } from '../../../Auth/AuthContext.js';

export default function EditorPage({ dark }) {
    const { id } = useParams();
    const { session } = useAuth();
    const readOnly = session?.role !== 'admin';
    const editorRef = useRef(null);

    const [loading, setLoading] = useState(!!id);
    const [preview, setPreview] = useState(false);
    const [notification, setNotification] = useState(null);

    const [initialContent, setInitialContent] = useState('');
    const [title, setTitle] = useState('');
    const [published, setPublished] = useState(false);

    useEffect(() => {
        if (!id) return;
        async function getInitialBlog() {
            try {
                const [result, ok] = await api(`/admin/blogs/${id}`);
                if (ok && result.blog) {
                    setInitialContent(result.blog.content);
                    setTitle(result.blog.title);
                    setPublished(result.blog.published);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        getInitialBlog();
    }, [id]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    async function handleSave() {
        if (!editorRef.current) return;

        const content = editorRef.current.getContent();
        if (!title.trim()) {
            setNotification("Please add a title before saving.");
            return;
        }

        const body = { published, title, content };
        const path = id ? `/admin/blogs/${id}` : '/admin/blogs';
        const method = id ? 'put' : 'post';

        const [result, ok] = await api(path, { method, body: JSON.stringify(body) });

        if (ok) setNotification('Article saved successfully!');
        else setNotification(result?.message || 'Failed to save article.');
    }

    const getPreviewContent = () => {
        return editorRef.current ? editorRef.current.getContent() : initialContent;
    };

    if (loading) return <div className="text-center py-20">Loading Editor...</div>;

    return (
        <div className="min-h-screen flex flex-col">
            {notification && <Notification message={notification} />}

            {preview && (
                <div className="fixed inset-0 z-50 bg-(--bg-primary) overflow-y-auto">
                    <div className="max-w-5xl mx-auto p-4">
                        <div className="flex justify-between items-center mb-8 sticky top-0 bg-(--bg-primary) py-4 border-b border-(--border-color) z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <GoEye className="text-(--accent)" />
                                Preview Mode
                            </h2>
                            <button
                                onClick={() => setPreview(false)}
                                className="px-4 py-2 border border-(--border-color) rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Close Preview
                            </button>
                        </div>
                        <Article preview={true} previewContent={{ title, content: getPreviewContent() }} />
                    </div>
                </div>
            )}

            <div className={`wrapper py-6 ${preview ? 'hidden' : ''}`}>
                {readOnly && (
                    <div role="status" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                        Read-only demo — nothing is saved.
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <Link to={'/admin/dashboard'} className="text-(--text-secondary) hover:text-(--text-primary) font-medium transition-colors">
                        &larr; Back to Dashboard
                    </Link>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setPreview(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-(--border-color) bg-(--bg-card) text-(--text-primary) hover:border-(--accent) hover:text-(--accent) transition-all duration-200 shadow-sm font-medium"
                        >
                            <GoEye className="text-lg" />
                            Preview
                        </button>

                        <button
                            onClick={handleSave}
                            className="btn-primary shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {id ? 'Update Article' : 'Save Draft'}
                        </button>
                    </div>
                </div>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-gray-400 mb-6 p-0"
                    type="text"
                    placeholder="Article Title..."
                />

                <div className="rounded-xl overflow-hidden shadow-sm border border-(--border-color)">
                    <MyEditor
                        initialValue={initialContent}
                        handleInit={(evt, editor) => editorRef.current = editor}
                        dark={dark}
                    />
                </div>
            </div>
        </div>
    );
}
