import { type PointerEvent, useEffect, useMemo, useState } from 'react';
import { type CodeforcesUser, colorForRank, fetchRatingHistory, fetchUserInfo, type RatingChange } from './codeforces';

const WIDTH = 760;
const HEIGHT = 296;
const PAD_LEFT = 44;
const PAD_RIGHT = 8;
const PAD_TOP = 20;
const PAD_BOTTOM = 36;
const X_LABEL_COUNT = 6;

function niceTicks(min: number, max: number, count: number): number[] {
    const step = Math.ceil((max - min) / count / 50) * 50 || 50;
    const ticks: number[] = [];
    for (let value = Math.ceil(min / step) * step; value <= max; value += step) ticks.push(value);
    return ticks;
}

function formatAxisDate(seconds: number): string {
    return new Date(seconds * 1000).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

export default function RatingChart() {
    const [history, setHistory] = useState<RatingChange[] | null>(null);
    const [user, setUser] = useState<CodeforcesUser | null>(null);
    const [failed, setFailed] = useState(false);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        let live = true;
        (async () => {
            try {
                const [ratings, users] = await Promise.all([fetchRatingHistory(), fetchUserInfo()]);
                if (!live) return;
                if (ratings.length === 0) {
                    setFailed(true);
                    return;
                }
                setHistory(ratings);
                setUser(users[0] ?? null);
            } catch {
                if (live) setFailed(true);
            }
        })();
        return () => {
            live = false;
        };
    }, []);

    const geometry = useMemo(() => {
        if (!history) return null;
        const ratings = history.map((c) => c.newRating);
        const min = Math.min(...ratings) - 60;
        const max = Math.max(...ratings) + 60;
        const stepX = (WIDTH - PAD_LEFT - PAD_RIGHT) / Math.max(history.length - 1, 1);
        const points = history.map((change, index) => {
            const x = PAD_LEFT + index * stepX;
            const y = PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * (1 - (change.newRating - min) / (max - min));
            return { x, y, change };
        });
        return { min, max, points };
    }, [history]);

    if (failed) return null;
    if (!history || !user || !geometry) {
        return <div className="h-[296px] w-full animate-pulse rounded-lg bg-(--border-subtle)" />;
    }

    const { min, max, points } = geometry;
    const baseline = HEIGHT - PAD_BOTTOM;
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseline} L ${points[0].x.toFixed(1)} ${baseline} Z`;
    const rankColor = colorForRank(user.rank);
    const ticks = niceTicks(min, max, 4);
    const active = hoverIndex !== null ? points[hoverIndex] : null;

    const xLabelStep = Math.max(1, Math.floor((points.length - 1) / (X_LABEL_COUNT - 1)));
    const xLabelIndexes =
        points.length <= X_LABEL_COUNT
            ? points.map((_, i) => i)
            : Array.from({ length: X_LABEL_COUNT }, (_, i) => Math.min(i * xLabelStep, points.length - 1));

    function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
        let nearest = 0;
        let nearestDist = Infinity;
        points.forEach((p, index) => {
            const dist = Math.abs(p.x - relativeX);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = index;
            }
        });
        setHoverIndex(nearest);
    }

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-baseline gap-x-6 gap-y-1 font-mono-ui">
                <span className="text-3xl font-bold" style={{ color: rankColor }}>
                    {user.rating}
                </span>
                <span className="text-sm capitalize text-(--text-secondary)">{user.rank}</span>
                <span className="text-xs text-(--text-tertiary)">
                    peak {user.maxRating} ({user.maxRank})
                </span>
                <span className="text-xs text-(--text-tertiary)">{history.length} rated contests</span>
            </div>

            <div className="relative">
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    className="w-full cursor-crosshair overflow-visible"
                    role="img"
                    aria-label={`Codeforces rating history, currently ${user.rating}`}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={() => setHoverIndex(null)}
                >
                    <defs>
                        <linearGradient id="cf-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={rankColor} stopOpacity="0.22" />
                            <stop offset="100%" stopColor={rankColor} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {ticks.map((tick) => {
                        const y = PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * (1 - (tick - min) / (max - min));
                        return (
                            <g key={tick}>
                                <line
                                    x1={PAD_LEFT}
                                    x2={WIDTH - PAD_RIGHT}
                                    y1={y}
                                    y2={y}
                                    stroke="var(--border-subtle)"
                                    strokeDasharray="3 4"
                                />
                                <text x={0} y={y + 3} fontSize={10} className="font-mono-ui fill-(--text-tertiary)">
                                    {tick}
                                </text>
                            </g>
                        );
                    })}

                    <path d={areaPath} fill="url(#cf-area)" />
                    <path
                        d={linePath}
                        fill="none"
                        stroke={rankColor}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    {points.map((p, index) => (
                        <circle
                            key={p.change.contestId}
                            cx={p.x}
                            cy={p.y}
                            r={hoverIndex === index ? 4.5 : 2.5}
                            fill={rankColor}
                            className="transition-[r] duration-100"
                        />
                    ))}

                    <line
                        x1={PAD_LEFT}
                        x2={WIDTH - PAD_RIGHT}
                        y1={baseline}
                        y2={baseline}
                        stroke="var(--border-subtle)"
                    />
                    {xLabelIndexes.map((index) => {
                        const p = points[index];
                        const anchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle';
                        return (
                            <text
                                key={p.change.contestId}
                                x={p.x}
                                y={baseline + 18}
                                fontSize={10}
                                textAnchor={anchor}
                                className="font-mono-ui fill-(--text-tertiary)"
                            >
                                {formatAxisDate(p.change.ratingUpdateTimeSeconds)}
                            </text>
                        );
                    })}

                    {active && (
                        <line
                            x1={active.x}
                            x2={active.x}
                            y1={PAD_TOP}
                            y2={baseline}
                            stroke={rankColor}
                            strokeOpacity={0.35}
                        />
                    )}
                </svg>

                {active && (
                    <div
                        className="surface-panel pointer-events-none absolute z-10 w-56 -translate-x-1/2 p-3 text-xs shadow-lg"
                        style={{
                            left: `${(active.x / WIDTH) * 100}%`,
                            top: active.y > HEIGHT / 2 ? undefined : `${((active.y + 14) / HEIGHT) * 100}%`,
                            bottom: active.y > HEIGHT / 2 ? `${((HEIGHT - active.y + 14) / HEIGHT) * 100}%` : undefined,
                        }}
                    >
                        <p className="font-mono-ui font-semibold text-(--text-primary)">{active.change.contestName}</p>
                        <p className="font-mono-ui mt-1 text-(--text-secondary)">
                            {active.change.oldRating} →{' '}
                            <span style={{ color: rankColor }} className="font-semibold">
                                {active.change.newRating}
                            </span>
                            {' · rank '}
                            {active.change.rank.toLocaleString()}
                        </p>
                        <p className="font-mono-ui mt-1 text-(--text-tertiary)">
                            {new Date(active.change.ratingUpdateTimeSeconds * 1000).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
