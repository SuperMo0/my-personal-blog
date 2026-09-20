const CODEFORCES_HANDLE = 'SuperMo';

export interface RatingChange {
    contestId: number;
    contestName: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
}

export interface Submission {
    id: number;
    creationTimeSeconds: number;
    problem: { name: string; rating?: number; contestId?: number; index: string };
    verdict?: string;
}

export interface CodeforcesUser {
    handle: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
    maxRank?: string;
}

async function cf<T>(method: string, params: string): Promise<T> {
    const response = await fetch(`https://codeforces.com/api/${method}?${params}`);
    const payload = await response.json();
    if (payload.status !== 'OK') throw new Error(payload.comment ?? 'Codeforces request failed');
    return payload.result as T;
}

export function fetchRatingHistory(): Promise<RatingChange[]> {
    return cf<RatingChange[]>('user.rating', `handle=${CODEFORCES_HANDLE}`);
}

export function fetchUserInfo(): Promise<CodeforcesUser[]> {
    return cf<CodeforcesUser[]>('user.info', `handles=${CODEFORCES_HANDLE}`);
}

export function fetchRecentSubmissions(count = 8): Promise<Submission[]> {
    return cf<Submission[]>('user.status', `handle=${CODEFORCES_HANDLE}&from=1&count=${count}`);
}

const RANK_COLORS: Record<string, string> = {
    newbie: '#9aa0a6',
    pupil: '#3fb950',
    specialist: '#2dd4bf',
    expert: '#4c8fff',
    'candidate master': '#c65ce6',
    master: '#ff9a3d',
    'international master': '#ff9a3d',
    grandmaster: '#f85149',
    'international grandmaster': '#f85149',
    'legendary grandmaster': '#f85149',
};

export function colorForRank(rank?: string): string {
    if (!rank) return 'var(--text-secondary)';
    return RANK_COLORS[rank.toLowerCase()] ?? 'var(--text-secondary)';
}

export { CODEFORCES_HANDLE };
