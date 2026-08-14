# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: recruiters, hiring managers, and technical evaluators.** They arrive from a CV, LinkedIn, GitHub, or a shared link to answer one question — can this person actually build software? They scan fast, often on a phone, and leave with a verdict.

**Secondary: developers reading the writing.** People who came for an article about code, algorithms, or the practice of building software.

Both audiences are real and both are served. When they compete for the same space or attention, **the evaluator's path wins**.

## Product Purpose

A personal site that is Mwafak Almahaini's credible public record as a software engineer: shipped projects, a CV, a verified competitive-programming record, and an actively maintained blog — all on one domain he owns.

Success is not a hiring campaign that ends. It is a durable proof-of-work profile he can point anyone at — a hiring team, a contest organizer, a collaborator, a student — and have it hold up on its own.

## Positioning

**Proof instead of claims.** Neighboring personal sites assert competence; this one demonstrates it and lets the visitor check:

- Authored-commit counts and last-activity dates pulled live from GitHub per project, not typed in by hand.
- Every project links to both a running deployment and its source.
- A real Codeforces solving history and named contest placements with the field size attached.
- A one-click read-only demo sign-in that lets a stranger walk through the admin dashboard and rich-text editor of the CMS behind the blog.

The site is simultaneously the portfolio and one of its exhibits: this blog is a listed project, running in production, being evaluated while it is being used.

## Operating Context

- **Arrival:** visitors come from a CV link, LinkedIn, GitHub, or a shared article URL. Many evaluate on mobile in under a minute.
- **Routes:** `/` (hero + article index), `/blogs/:id` (article with comments and likes), `/about` (bio, projects, competitive programming, social links), `/cv`, `/contact` → redirects to `/about#social`, `/admin/login`, `/admin/dashboard`, `/admin/editor/:id?`.
- **Reading:** no account required. Comments take a name and content; likes are anonymous and toggleable.
- **Owner publishing:** sign in → dashboard lists articles with view and like counts → TinyMCE rich-text editor → publish, unpublish, or delete.
- **Read-only demo:** `/admin/demo-login` signs a visitor in as a `viewer` account with full read access to the dashboard and editor and no write access. *Inferred from the README's provisioning section, the dedicated route, and the login page's "Explore the dashboard safely" copy — treated as a deliberate portfolio exhibit for the primary audience, not an internal tool.*
- **Deployment:** one Express process serves both the API and the built SPA, at `https://mowafak-blog.onrender.com`.

## Capabilities and Constraints

**Roles.** Public visitor (no account), `admin` (the owner), `viewer` (the read-only demo). Auth is a JWT bearer token. There is no public sign-up and none is planned.

- **Public:** browse published articles, read an article, comment with a name and content, like and unlike.
- **Admin:** create, edit, publish/unpublish, and delete articles through TinyMCE; see per-article view and like counts.
- **Viewer:** identical read access to the dashboard and editor; every write is rejected with 403 and the message "This is a read-only demo account. Changes are not allowed."

**Live GitHub data degrades to nothing.** `/api/github-activity` reads seven public repositories server-side and caches successes in memory for six hours; the token is backend-only and must never reach a `VITE_` variable. If GitHub is unreachable before the cache warms, the About page omits the activity figures entirely. Any surface showing this data must disappear cleanly rather than render an error or a zero.

**Content safety.** Article HTML is sanitized with DOMPurify; code blocks are highlighted with Prism.

**Theming.** Light and dark are user-toggled and persisted to `localStorage`, defaulting to the OS preference. Both themes are first-class and neither is the fallback.

**Terminology is currently inconsistent** and worth settling: the API and database say `blogs`, the frontend components and dashboard say `articles`, and the primary nav link reads "Blogs". Pick one public-facing word and use it everywhere the visitor can see.

## Brand Commitments

- **Name:** Mwafak Almahaini. The header wordmark sets "Mwafak" in the accent color followed by "Almahaini", which collapses to the first name alone on narrow screens.
- **Real identity is published**, deliberately: Cairo, Egypt · open to relocate; `+20 100 686 4406`; `moofk2002@gmail.com`; LinkedIn `mowafk-mha`; GitHub `SuperMo0`; Codeforces `SuperMo`.
- **Voice:** first person, plain, specific. Existing copy states numbers where a weaker version would reach for adjectives ("129th of 1,734 participants", "50+ contests", "more than 20 full-stack projects"). No hype, no superlatives about himself.
- **Downloadable CV** at `/Mwafak-Almahaini-CV.pdf`, kept in sync with the CV page.

## Evidence on Hand

**Real and usable:**

- Published articles, added regularly — design may assume genuine content exists rather than planning around an empty shell.
- Seven real projects in `Frontend/src/data/projects.js`, each with a repository and most with a live URL. Three are featured with cover images: Movies Club, SYNC Hub (team project at `app.sync.ngo`), and Real-Time Chat.
- Live per-project authored-commit counts and last-activity dates from GitHub.
- Competitive programming record: Codeforces Specialist after 50+ contests; ECPC 2025 — 129th of 1,734 participants and 4th among 80+ university teams; first place, Nile University Competitive Programming Arena 2025; official ICPC coach for six teams preparing for ICPC 2026.
- Completed The Odin Project curriculum (20+ full-stack projects); currently on SYNC's software engineering team; works in React, TypeScript, and Python with a focus on practical AI integrations.
- Images in `Frontend/public/images/`, all `.webp`: profile photo, GitHub contribution graph, Codeforces history, CV render, and three project covers. A demo GIF at `preview/app.gif`.

**Absent — never fabricate:** testimonials, client or employer logos, press mentions, readership or traffic numbers, awards beyond those listed above, pricing, and availability claims.

## Product Principles

1. **Proof over claims.** Every assertion on this site should be checkable by the visitor — a live link, a commit count, a contest placement with its field size, a demo they can sign into.
2. **The evaluator wins ties.** When the portfolio and the blog compete for a slot, a viewport, or a visitor's first ten seconds, the evaluation path takes it.
3. **Real content only.** Absent evidence stays absent. A design that needs a testimonial to work is the wrong design.
4. **Degrade to silence.** Anything sourced from live external data must vanish cleanly when unavailable — never a zero, never an error, never an empty frame where a number was promised.
5. **Judged fast, on a phone.** A stranger arriving from a link should be able to place him correctly before deciding whether to scroll.

## Accessibility & Inclusion

No formal standard has been set. The existing code shows deliberate practice that future work must preserve rather than regress: labeled landmark sections (`aria-labelledby`), `aria-label` on icon-only controls, `prefers-reduced-motion` guarding smooth scroll, explicit `width`/`height` on every image to prevent layout shift, and descriptive alt text. Both themes are maintained at usable contrast.
