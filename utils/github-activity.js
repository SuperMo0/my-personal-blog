export const GITHUB_AUTHOR = 'SuperMo0';

export const GITHUB_PROJECTS = [
    { slug: 'movies-club', repository: 'SuperMo0/movies-club' },
    { slug: 'real-time-chat', repository: 'SuperMo0/my-chatting-app' },
    { slug: 'sync-hub', repository: 'sync-ngo-sy/sync-hub-v2' },
    { slug: 'this-blog', repository: 'SuperMo0/my-personal-blog' },
    { slug: 'ai-engineering-curriculum', repository: 'SuperMo0/ai-engineering-curriculum' },
    { slug: 'multi-model-ai-assistant', repository: 'SuperMo0/multi-model-ai-assistant' },
    { slug: 'automated-research-agent', repository: 'SuperMo0/langgraph-automated-research-agent' },
];

const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_REQUEST_TIMEOUT_MS = 10 * 1000;
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const PROJECT_CONCURRENCY = 3;

async function mapWithConcurrency(items, limit, mapper) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < items.length) {
            const index = nextIndex;
            nextIndex += 1;
            results[index] = await mapper(items[index], index);
        }
    }

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
}

const CONTRIBUTION_CALENDAR_QUERY = `
    query($login: String!) {
        user(login: $login) {
            contributionsCollection {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            date
                            contributionCount
                        }
                    }
                }
            }
        }
    }
`;

async function fetchContributionCalendar({ author, token, fetchImpl, requestTimeoutMs }) {
    const signal = AbortSignal.timeout(requestTimeoutMs);
    const response = await fetchImpl(GITHUB_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SuperMo0-personal-blog',
        },
        body: JSON.stringify({ query: CONTRIBUTION_CALENDAR_QUERY, variables: { login: author } }),
        signal,
    });

    if (!response.ok) {
        throw new Error('GitHub contribution calendar request failed');
    }

    const payload = await response.json();
    const calendar = payload?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar || !Array.isArray(calendar.weeks)) {
        throw new Error('GitHub returned an unexpected contribution calendar response');
    }

    return {
        totalContributions: calendar.totalContributions,
        days: calendar.weeks.flatMap((week) =>
            week.contributionDays.map((day) => ({
                date: day.date,
                count: day.contributionCount,
            })),
        ),
    };
}

function lastPageFrom(linkHeader) {
    if (!linkHeader) return null;

    const lastLink = linkHeader.split(',').find((link) => /rel="last"/.test(link));

    if (!lastLink) return null;

    const url = lastLink.match(/<([^>]+)>/)?.[1];
    const page = url ? Number(new URL(url).searchParams.get('page')) : NaN;
    return Number.isInteger(page) && page >= 1 ? page : null;
}

async function projectActivity({ repository, author, token, fetchImpl, requestTimeoutMs }) {
    const commitsUrl = new URL(`/repos/${repository}/commits`, 'https://api.github.com');
    commitsUrl.searchParams.set('author', author);
    commitsUrl.searchParams.set('per_page', '1');
    commitsUrl.searchParams.set('page', '1');
    const repositoryUrl = new URL(`/repos/${repository}`, 'https://api.github.com');
    const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'SuperMo0-personal-blog',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    const signal = AbortSignal.timeout(requestTimeoutMs);
    const [commitsResponse, repositoryResponse] = await Promise.all([
        fetchImpl(commitsUrl, { headers, signal }),
        fetchImpl(repositoryUrl, { headers, signal }),
    ]);

    if (!commitsResponse.ok || !repositoryResponse.ok) {
        throw new Error(`GitHub activity request failed for ${repository}`);
    }

    const [commits, repositoryDetails] = await Promise.all([commitsResponse.json(), repositoryResponse.json()]);
    if (!Array.isArray(commits) || typeof repositoryDetails !== 'object' || !repositoryDetails) {
        throw new Error(`GitHub returned an unexpected response for ${repository}`);
    }

    const lastPage = lastPageFrom(commitsResponse.headers.get('link'));
    const commitCount = commits.length === 0 ? 0 : (lastPage ?? 1);

    return {
        commits: commitCount,
        lastActivityAt: repositoryDetails.pushed_at ?? null,
        stars: repositoryDetails.stargazers_count ?? 0,
    };
}

export function createGitHubActivity({
    token = process.env.GITHUB_TOKEN,
    fetchImpl = globalThis.fetch,
    requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
} = {}) {
    let cachedActivity = null;
    let expiresAt = 0;
    let inFlightActivityPromise = null;
    async function fetchActivity() {
        if (!token) {
            throw new Error('GITHUB_TOKEN is not configured');
        }

        const [projects, contributionCalendar] = await Promise.all([
            mapWithConcurrency(GITHUB_PROJECTS, PROJECT_CONCURRENCY, async ({ slug, repository }) => ({
                slug,
                repository,
                ...(await projectActivity({
                    repository,
                    author: GITHUB_AUTHOR,
                    token,
                    fetchImpl,
                    requestTimeoutMs,
                })),
            })),
            fetchContributionCalendar({ author: GITHUB_AUTHOR, token, fetchImpl, requestTimeoutMs }).catch(() => null),
        ]);

        return {
            author: GITHUB_AUTHOR,
            totalCommits: projects.reduce((total, project) => total + project.commits, 0),
            projects,
            contributionCalendar,
            fetchedAt: new Date().toISOString(),
        };
    }

    return async function getGitHubActivity() {
        if (cachedActivity && Date.now() < expiresAt) {
            return cachedActivity;
        }

        if (!inFlightActivityPromise) {
            inFlightActivityPromise = fetchActivity()
                .then((activity) => {
                    cachedActivity = activity;
                    expiresAt = Date.now() + DEFAULT_CACHE_TTL_MS;
                    return activity;
                })
                .finally(() => {
                    inFlightActivityPromise = null;
                });
        }

        return inFlightActivityPromise;
    };
}
