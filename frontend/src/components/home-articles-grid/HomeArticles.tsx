import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import api from '../../utils/Api';
import ArticleCard, { type Article, ArticleCardSkeleton } from '../article-card/ArticleCard';

export default function HomeArticles() {
    const [articles, setArticles] = useState<Article[] | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [result, ok] = await api<{ blogs: Article[] }>('/blogs');
                if (ok) setArticles(result.blogs);
            } catch (error) {
                console.error('Fetch error', error);
            }
        }
        fetchData();
    }, []);

    return (
        <div>
            {articles && (
                <p className="font-mono-ui mb-6 text-xs text-(--text-tertiary)">
                    {articles.length} post{articles.length === 1 ? '' : 's'}
                </p>
            )}

            {articles ? (
                articles.length > 0 ? (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
                        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {articles.map((article) => (
                            <motion.div
                                key={article.id}
                                variants={{
                                    hidden: { opacity: 0, y: 16 },
                                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                                }}
                            >
                                <ArticleCard article={article} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <p className="font-mono-ui text-(--text-secondary)">Nothing published yet — check back soon.</p>
                )
            ) : (
                <div
                    role="status"
                    aria-label="Loading articles"
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {[1, 2, 3].map((n) => (
                        <ArticleCardSkeleton key={n} />
                    ))}
                </div>
            )}
        </div>
    );
}
