import { useEffect, useMemo, useState } from 'react';
import apiRequest from '../../utils/Api';

interface ContributionDay {
    date: string;
    count: number;
}

interface ContributionCalendar {
    totalContributions: number;
    days: ContributionDay[];
}

interface GitHubActivity {
    author: string;
    totalCommits: number;
    contributionCalendar: ContributionCalendar | null;
}

const CELL = 10;
const GAP = 3;
const LABEL_WIDTH = 24;
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function levelFor(count: number, thresholds: number[]): number {
    if (count <= 0) return 0;
    for (let level = thresholds.length; level >= 1; level -= 1) {
        if (count >= thresholds[level - 1]) return level;
    }
    return 1;
}

function computeThresholds(days: ContributionDay[]): number[] {
    const max = days.reduce((peak, day) => Math.max(peak, day.count), 0);
    if (max <= 1) return [1, 1, 1, 1];
    return [1, Math.ceil(max * 0.25), Math.ceil(max * 0.5), Math.ceil(max * 0.75)];
}

function computeStreak(days: ContributionDay[]): number {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i -= 1) {
        if (days[i].count > 0) streak += 1;
        else if (i !== days.length - 1 || days[i].date !== new Date().toISOString().slice(0, 10)) break;
    }
    return streak;
}

export default function CommitHeatmap() {
    const [activity, setActivity] = useState<GitHubActivity | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let live = true;
        (async () => {
            try {
                const [result, ok] = await apiRequest<GitHubActivity>('/github-activity');
                if (live && ok && result?.contributionCalendar) setActivity(result);
                else if (live) setFailed(true);
            } catch {
                if (live) setFailed(true);
            }
        })();
        return () => {
            live = false;
        };
    }, []);

    const weeks = useMemo(() => {
        const days = activity?.contributionCalendar?.days;
        if (!days || days.length === 0) return null;

        const first = new Date(`${days[0].date}T00:00:00Z`);
        const leadingBlanks = first.getUTCDay();
        const padded: (ContributionDay | null)[] = [...Array.from({ length: leadingBlanks }, () => null), ...days];

        const columns: (ContributionDay | null)[][] = [];
        for (let i = 0; i < padded.length; i += 7) {
            columns.push(padded.slice(i, i + 7));
        }
        return columns;
    }, [activity]);

    const thresholds = useMemo(() => computeThresholds(activity?.contributionCalendar?.days ?? []), [activity]);

    if (failed || !weeks) return null;

    const streak = computeStreak(activity?.contributionCalendar?.days ?? []);
    const width = LABEL_WIDTH + weeks.length * (CELL + GAP);
    const height = 7 * (CELL + GAP);

    return (
        <div className="w-full">
            <div className="overflow-x-auto pb-1">
                <svg
                    role="img"
                    aria-label={`${activity?.contributionCalendar?.totalContributions} GitHub contributions in the last year`}
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    className="min-w-full"
                    style={{ minWidth: width }}
                >
                    {WEEKDAY_LABELS.map(
                        (label, dayIndex) =>
                            label && (
                                <text
                                    key={label}
                                    x={0}
                                    y={dayIndex * (CELL + GAP) + CELL - 1}
                                    className="font-mono-ui fill-(--text-tertiary)"
                                    fontSize={9}
                                >
                                    {label}
                                </text>
                            ),
                    )}
                    {weeks.map((week, weekIndex) =>
                        week.map((day, dayIndex) => {
                            if (!day) return null;
                            const level = levelFor(day.count, thresholds);
                            const delay = (weekIndex + dayIndex) * 4;
                            return (
                                <rect
                                    key={day.date}
                                    className="heatmap-cell"
                                    x={LABEL_WIDTH + weekIndex * (CELL + GAP)}
                                    y={dayIndex * (CELL + GAP)}
                                    width={CELL}
                                    height={CELL}
                                    rx={2.5}
                                    fill={`var(--data-${level})`}
                                    style={{ animationDelay: `${delay}ms` }}
                                >
                                    <title>{`${day.count.toLocaleString()} contribution${day.count === 1 ? '' : 's'} on ${new Date(`${day.date}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}</title>
                                </rect>
                            );
                        }),
                    )}
                </svg>
            </div>

            <div className="font-mono-ui mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-(--text-secondary)">
                <span>
                    <strong className="text-(--text-primary)">
                        {activity?.contributionCalendar?.totalContributions.toLocaleString()}
                    </strong>{' '}
                    contributions, last 12 months
                </span>
                {streak > 0 && (
                    <span>
                        <strong className="text-(--data-4)">{streak}</strong>-day active streak
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    less
                    {[0, 1, 2, 3, 4].map((level) => (
                        <span
                            key={level}
                            className="inline-block h-2.5 w-2.5 rounded-[2px]"
                            style={{ backgroundColor: `var(--data-${level})` }}
                        />
                    ))}
                    more
                </span>
            </div>
        </div>
    );
}
