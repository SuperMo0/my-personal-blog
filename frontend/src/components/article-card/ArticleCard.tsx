import { useEffect, useState } from 'react';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import { Link } from 'react-router';
import api from '../../utils/Api';

export interface Article {
    id: number | string;
    title: string;
    created_at: string;
    likes: number;
}

const cardShell =
    'surface-panel group relative flex h-full flex-col p-6 transition-colors duration-300 hover:border-(--accent) cursor-pointer';

export function ArticleCardSkeleton() {
    return (
        <article className={cardShell} aria-hidden="true">
            <div className="mb-5 h-3 w-24 animate-pulse rounded bg-(--border-subtle)" />
            <div className="mb-6 flex grow flex-col gap-2">
                <div className="h-6 w-full animate-pulse rounded bg-(--border-subtle)" />
                <div className="h-6 w-7/12 animate-pulse rounded bg-(--border-subtle)" />
            </div>
            <div className="flex items-center justify-between border-t border-(--border-subtle) pt-4">
                <div className="h-3 w-16 animate-pulse rounded bg-(--border-subtle)" />
                <div className="h-7 w-12 animate-pulse rounded-full bg-(--border-subtle)" />
            </div>
        </article>
    );
}

export default function ArticleCard({ article }: { article: Article }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(article.likes);

    useEffect(() => {
        const hasLiked = localStorage.getItem(`like-${article.id}`);
        if (hasLiked) setLiked(true);
    }, [article.id]);

    async function handleLike() {
        const newStatus = !liked;
        setLiked(newStatus);
        setLikeCount((prev) => (newStatus ? prev + 1 : prev - 1));

        await api(`/blogs/${article.id}/like`, { method: 'post', body: JSON.stringify({ liked: newStatus }) });

        if (newStatus) localStorage.setItem(`like-${article.id}`, 'true');
        else localStorage.removeItem(`like-${article.id}`);
    }

    return (
        <article className={cardShell}>
            <Link to={`/blogs/${article.id}`} className="absolute inset-0 z-0" aria-label={article.title} />

            <p className="font-mono-ui mb-5 text-xs text-(--text-tertiary)">
                {new Date(article.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}
            </p>

            <h2 className="font-display mb-6 grow text-xl font-bold leading-snug text-pretty transition-colors group-hover:text-(--accent)">
                {article.title}
            </h2>

            <div className="relative z-10 flex items-center justify-between border-t border-(--border-subtle) pt-4">
                <span className="font-mono-ui text-xs text-(--text-tertiary)">read →</span>

                <button
                    type="button"
                    onClick={handleLike}
                    className="font-mono-ui flex items-center gap-1.5 rounded-full border border-(--border-subtle) px-3 py-1.5 text-xs transition-all hover:border-(--accent) hover:scale-105"
                >
                    <span className="font-semibold">{likeCount}</span>
                    {liked ? (
                        <GoHeartFill className="text-(--accent)" aria-hidden="true" />
                    ) : (
                        <GoHeart aria-hidden="true" />
                    )}
                </button>
            </div>
        </article>
    );
}
