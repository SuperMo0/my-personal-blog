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

function lastPageFrom(linkHeader) {
    if (!linkHeader) return null;

    const lastLink = linkHeader
        .split(',')
        .find((link) => /rel="last"/.test(link));

    if (!lastLink) return null;

    const url = lastLink.match(/<([^>]+)>/)?.[1];
    const page = url ? Number(new URL(url).searchParams.get('page')) : NaN;
    return Number.isInteger(page) && page >= 1 ? page : null;
}

async function authoredActivity({ repository, author, token, fetchImpl }) {
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
    const [commitsResponse, repositoryResponse] = await Promise.all([
        fetchImpl(commitsUrl, { headers }),
        fetchImpl(repositoryUrl, { headers }),
    ]);

    if (!commitsResponse.ok || !repositoryResponse.ok) {
        throw new Error(`GitHub activity request failed for ${repository}`);
    }

    const [commits, repositoryDetails] = await Promise.all([
        commitsResponse.json(),
        repositoryResponse.json(),
    ]);
    if (!Array.isArray(commits) || typeof repositoryDetails !== 'object' || !repositoryDetails) {
        throw new Error(`GitHub returned an unexpected response for ${repository}`);
    }

    const lastPage = lastPageFrom(commitsResponse.headers.get('link'));
    const commitCount = commits.length === 0 ? 0 : (lastPage ?? 1);

    return {
        commits: commitCount,
        lastActivityAt: repositoryDetails.pushed_at ?? null,
    };
}

export function createGitHubActivity({
    token = process.env.GITHUB_TOKEN,
    fetchImpl = globalThis.fetch,
} = {}) {
    let cachedActivity = null;
    let expiresAt = 0;
    let inFlightActivityPromise = null;
    async function fetchActivity() {
        if (!token) {
            throw new Error('GITHUB_TOKEN is not configured');
        }

        const projects = await Promise.all(GITHUB_PROJECTS.map(async ({ slug, repository }) => ({
            slug,
            repository,
            ...await authoredActivity({
                repository,
                author: GITHUB_AUTHOR,
                token,
                fetchImpl,
            }),
        })));

        return {
            author: GITHUB_AUTHOR,
            totalCommits: projects.reduce((total, project) => total + project.commits, 0),
            projects,
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
