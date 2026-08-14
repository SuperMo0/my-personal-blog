import React, { useEffect, useState } from 'react';
import { GoHeart, GoHeartFill } from "react-icons/go";
import { useNavigate } from 'react-router';
import api from './../../utils/Api.js';

// Shared by the card and its skeleton so the two cannot drift out of shape.
const cardShell = 'article-card-custom relative flex flex-col border border-(--border-color) rounded-2xl overflow-hidden';
const cardBody = 'p-5 flex flex-col grow h-full justify-between';
const cardFooter = 'flex items-center justify-between pt-4 border-t border-(--border-color)/30 mt-auto';

// Mirrors the card's real anatomy: no cover image, a wrapping title, then a
// divided footer holding the date and the like pill.
export function ArticleCardSkeleton() {
    return (
        <article className={cardShell} aria-hidden="true">
            <div className={`${cardBody} animate-pulse`}>
                <div className="mb-4 space-y-2">
                    <div className="h-5 w-full rounded bg-(--text-secondary)" />
                    <div className="h-5 w-7/12 rounded bg-(--text-secondary)" />
                </div>

                <div className={cardFooter}>
                    <div className="h-4 w-16 rounded bg-(--text-secondary)" />
                    <div className="h-8 w-14 rounded-full bg-(--text-secondary)" />
                </div>
            </div>
        </article>
    );
}

export default function ArticleCard({ article }) {
    let navigate = useNavigate();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(article.likes);

    useEffect(() => {
        const hasLiked = localStorage.getItem(`like-${article.id}`);
        if (hasLiked) setLiked(true);
    }, [article.id]);

    async function handleLike(e) {
        e.stopPropagation();

        const newStatus = !liked;
        setLiked(newStatus);
        setLikeCount(prev => newStatus ? prev + 1 : prev - 1);

        await api(`/blogs/${article.id}/like`, { method: 'post', body: JSON.stringify({ liked: newStatus }) });

        if (newStatus) localStorage.setItem(`like-${article.id}`, 'true');
        else localStorage.removeItem(`like-${article.id}`);
    }

    return (
        <article
            onClick={() => navigate(`/blogs/${article.id}`)}
            className={`${cardShell} group hover:shadow-xl hover:border-(--accent) transition-all duration-300 cursor-pointer`}
        >
            <div className={cardBody}>
                <h2 className="text-xl font-bold mb-4 line-clamp-3 leading-tight group-hover:text-(--accent) transition-colors">
                    {article.title}
                </h2>

                <div className={cardFooter}>
                    <span className="text-sm font-semibold opacity-70">
                        {new Date(article.created_at).toLocaleDateString()}
                    </span>

                    <button
                        onClick={handleLike}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-sm hover:scale-105 transition-all"
                    >
                        <span className="font-bold text-sm">{likeCount}</span>
                        {liked ? (
                            <GoHeartFill className="text-(--accent) text-lg animate-bounce-short" />
                        ) : (
                            <GoHeart className="text-lg" />
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
}