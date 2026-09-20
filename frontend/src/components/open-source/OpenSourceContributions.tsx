import { useEffect, useState } from 'react';
import apiRequest from '../../utils/Api';
import { RevealGroup, RevealItem } from '../reveal/Reveal';

interface Contribution {
    id: number;
    project: string;
    title: string;
    url: string;
    description: string | null;
    contributed_at: string | null;
}

function formatDate(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
}

export default function OpenSourceContributions() {
    const [contributions, setContributions] = useState<Contribution[] | null>(null);

    useEffect(() => {
        let live = true;
        (async () => {
            try {
                const [result, ok] = await apiRequest<{ contributions: Contribution[] }>('/open-source-contributions');
                if (live && ok && Array.isArray(result.contributions)) setContributions(result.contributions);
            } catch {
                // Degrades to silence when unavailable.
            }
        })();
        return () => {
            live = false;
        };
    }, []);

    if (contributions !== null && contributions.length === 0) return null;
    if (!contributions) {
        return (
            <div className="divide-y divide-(--border-subtle)">
                {[1, 2].map((n) => (
                    <div key={n} className="h-16 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <RevealGroup className="divide-y divide-(--border-subtle)">
            {contributions.map((contribution) => {
                const date = formatDate(contribution.contributed_at);
                return (
                    <RevealItem key={contribution.id} className="py-5">
                        <a
                            href={contribution.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"
                        >
                            <span className="flex flex-wrap items-baseline gap-x-3">
                                <span className="font-mono-ui text-sm font-semibold text-(--text-secondary)">
                                    {contribution.project}
                                </span>
                                <span className="text-(--text-primary) transition-colors group-hover:text-(--accent)">
                                    {contribution.title}
                                </span>
                            </span>
                            {date && (
                                <span className="font-mono-ui shrink-0 text-xs text-(--text-tertiary)">{date}</span>
                            )}
                        </a>
                        {contribution.description && (
                            <p className="mt-1.5 text-sm text-(--text-secondary)">{contribution.description}</p>
                        )}
                    </RevealItem>
                );
            })}
        </RevealGroup>
    );
}
