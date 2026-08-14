export const SITE_URL = 'https://mwafak.dev';
export const SITE_NAME = 'Mwafak Almahaini';

const DEFAULT_DESCRIPTION = 'Mwafak Almahaini is a full-stack software engineer in Cairo. Articles on code, algorithms, and the practice of building software.';
const DEFAULT_IMAGE = `${SITE_URL}/images/mwafak-almahaini.webp`;

const STATIC_PAGES = {
    '/': {
        title: `${SITE_NAME} — Software Engineer`,
        description: DEFAULT_DESCRIPTION,
    },
    '/about': {
        title: `About — ${SITE_NAME}`,
        description: 'Projects, live GitHub activity, and a competitive programming record from Mwafak Almahaini, full-stack software engineer.',
    },
    '/cv': {
        title: `CV — ${SITE_NAME}`,
        description: 'CV of Mwafak Almahaini, full-stack software engineer in Cairo, Egypt.',
    },
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function summarise(html, limit = 160) {
    const text = String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length <= limit) return text;
    return `${text.slice(0, limit - 1).replace(/\s+\S*$/, '')}…`;
}

export function articleMeta(blog) {
    return {
        title: `${blog.title} — ${SITE_NAME}`,
        description: summarise(blog.content) || DEFAULT_DESCRIPTION,
        path: `/blogs/${blog.id}`,
        type: 'article',
        publishedAt: blog.created_at,
    };
}

export function staticMeta(pathname) {
    const page = STATIC_PAGES[pathname];
    if (!page) return null;
    return { ...page, path: pathname, type: 'website' };
}

export function renderTags(meta) {
    const url = `${SITE_URL}${meta.path === '/' ? '/' : meta.path}`;
    const title = escapeHtml(meta.title);
    const description = escapeHtml(meta.description);

    const tags = [
        `<title>${title}</title>`,
        `<meta name="description" content="${description}" />`,
        `<link rel="canonical" href="${url}" />`,
        `<meta property="og:type" content="${meta.type}" />`,
        `<meta property="og:site_name" content="${SITE_NAME}" />`,
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${description}" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:image" content="${DEFAULT_IMAGE}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
    ];

    if (meta.publishedAt) {
        tags.push(`<meta property="article:published_time" content="${new Date(meta.publishedAt).toISOString()}" />`);
    }

    return tags.join('\n  ');
}

export function injectMeta(html, meta) {
    return html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n  ${renderTags(meta)}\n  <!--seo:end-->`);
}

export function renderSitemap(blogs) {
    const entries = [
        { loc: `${SITE_URL}/`, priority: '1.0' },
        { loc: `${SITE_URL}/about`, priority: '0.8' },
        { loc: `${SITE_URL}/cv`, priority: '0.6' },
        ...blogs.map((blog) => ({
            loc: `${SITE_URL}/blogs/${blog.id}`,
            lastmod: new Date(blog.created_at).toISOString().slice(0, 10),
            priority: '0.7',
        })),
    ];

    const urls = entries.map(({ loc, lastmod, priority }) => [
        '  <url>',
        `    <loc>${loc}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        `    <priority>${priority}</priority>`,
        '  </url>',
    ].filter(Boolean).join('\n')).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
