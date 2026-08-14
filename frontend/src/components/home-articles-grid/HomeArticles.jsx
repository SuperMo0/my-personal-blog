import React, { useEffect, useState } from 'react';
import ArticleCard, { ArticleCardSkeleton } from '../article-card/ArticleCard';
import api from './../../utils/Api';

export default function HomeArticles() {
    const [articles, setArticles] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                let [result, ok] = await api('/blogs');
                if (ok) setArticles(result.blogs);
            } catch (error) {
                console.error("Fetch error", error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="wrapper pb-24">
            {articles ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <div
                    role="status"
                    aria-label="Loading articles"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {[1, 2, 3].map((n) => (
                        <ArticleCardSkeleton key={n} />
                    ))}
                </div>
            )}
        </div>
    );
}