import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import DOMPurify from 'dompurify';
import prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import api from './../../../utils/Api.js';
import Comments from './../../Comments/Comments.jsx';
import useDocumentMeta from './../../../utils/useDocumentMeta.js';

export default function Article({ preview, previewContent }) {
    const { id } = useParams();
    const [article, setArticle] = useState(previewContent || null);
    const articleRef = useRef(null);

    useEffect(() => {
        if (preview) return;

        async function getArticle() {
            try {
                let [result, ok] = await api(`/blogs/${id}`);
                if (ok) setArticle(result.blog);
            } catch (e) {
                console.error(e);
            }
        }
        getArticle();
    }, [id, preview]);

    useEffect(() => {
        if (!article || !articleRef.current) return;
        articleRef.current.querySelectorAll('code[class*="language-"]').forEach(el => {
            el.removeAttribute('data-highlighted');
        });
        prism.highlightAllUnder(articleRef.current);
    });

    const sanitizedHTML = useMemo(
        () => article ? DOMPurify.sanitize(article.content, { ADD_ATTR: ['target'] }) : '',
        [article]
    );

    useDocumentMeta(
        !preview && article?.title ? `${article.title} — Mwafak Almahaini` : null,
    );

    if (!article && !preview) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="wrapper py-12">
            <header className="max-w-3xl mx-auto mb-10 text-center">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                    {article.title}
                </h1>
                <div className="text-(--text-secondary)">
                    {article.created_at && new Date(article.created_at).toLocaleDateString(undefined, {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </div>
            </header>

            <article
                ref={articleRef}
                className="prose prose-lg dark:prose-invert max-w-3xl mx-auto 
                prose-a:text-(--accent) prose-img:rounded-xl prose-img:w-full 
                prose-pre:bg-[#1d1f21] prose-pre:shadow-lg prose-pre:border prose-pre:border-gray-700"
                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
            />

            {!preview && (
                <div className="max-w-3xl mx-auto mt-20 pt-10 border-t border-(--border-color)">
                    <Comments id={id} />
                </div>
            )}
        </div>
    );
}