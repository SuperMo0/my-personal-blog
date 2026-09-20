import { useEffect, useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { GoStarFill, GoTrophy } from 'react-icons/go';
import { SiCodeforces } from 'react-icons/si';
import projects, { type Project } from '../../../data/projects';
import apiRequest from '../../../utils/Api';
import useDocumentMeta from '../../../utils/useDocumentMeta';
import RatingChart from '../../codeforces-panel/RatingChart';
import Hero from '../../hero/Hero';
import OpenSourceContributions from '../../open-source/OpenSourceContributions';
import Reveal, { RevealGroup, RevealItem } from '../../reveal/Reveal';
import SocialLink from '../../social-link/SocialLink';

interface ProjectActivity {
    slug: string;
    commits: number;
    lastActivityAt: string | null;
    stars: number;
}

function StarCount({ activity }: { activity?: ProjectActivity }) {
    if (!activity?.stars) return null;
    return (
        <span className="font-mono-ui inline-flex items-center gap-1 text-xs text-(--text-tertiary)">
            <GoStarFill className="text-(--accent)" aria-hidden="true" />
            {activity.stars.toLocaleString()}
        </span>
    );
}

interface GitHubActivityResponse {
    projects: ProjectActivity[];
}

const featuredProjects = projects.filter((project) => project.featured);
const listedProjects = projects.filter((project) => !project.featured);

function formatActivityDate(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function ActivityLine({ activity }: { activity?: ProjectActivity }) {
    if (!activity) return null;
    const lastActivity = formatActivityDate(activity.lastActivityAt);
    return (
        <p className="project-activity font-mono-ui mt-3 text-xs leading-relaxed tracking-wide text-(--text-tertiary) tabular-nums">
            <span className="font-semibold text-(--text-secondary)">{activity.commits.toLocaleString()}</span> authored
            commits
            {lastActivity && <> · last activity {lastActivity}</>}
        </p>
    );
}

function ProjectCard({ project, activity }: { project: Project; activity?: ProjectActivity }) {
    return (
        <article className="surface-panel group flex h-full flex-col overflow-hidden transition-colors hover:border-(--accent)">
            {project.cover && (
                <a
                    href={project.live ?? project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={-1}
                    className="block overflow-hidden border-b border-(--border-subtle)"
                >
                    <img
                        src={project.cover}
                        alt={project.coverAlt}
                        width={project.coverWidth}
                        height={project.coverHeight}
                        className="aspect-video w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.03]"
                    />
                </a>
            )}
            <div className="flex grow flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-bold leading-tight text-pretty">
                        <a
                            href={project.live ?? project.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-(--accent)"
                        >
                            {project.name}
                        </a>
                        {project.teamNote && (
                            <span className="font-mono-ui ml-2 text-xs font-normal text-(--text-tertiary)">
                                — {project.teamNote}
                            </span>
                        )}
                    </h3>
                    <StarCount activity={activity} />
                </div>
                <p className="mt-2 grow leading-relaxed text-pretty text-(--text-secondary)">{project.tagline}</p>

                <div className="font-mono-ui mt-4 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                        <span
                            key={tech}
                            className="rounded border border-(--border-subtle) px-1.5 py-0.5 text-[11px] text-(--text-tertiary)"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <ActivityLine activity={activity} />

                <div className="font-mono-ui mt-5 flex gap-5 border-t border-(--border-subtle) pt-4 text-sm font-semibold">
                    {project.live && (
                        <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-(--accent) transition-colors hover:text-(--accent-strong)"
                        >
                            Live →
                        </a>
                    )}
                    <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                    >
                        Source
                    </a>
                </div>
            </div>
        </article>
    );
}

const ACHIEVEMENTS: { time: string; text: string }[] = [
    { time: '2026', text: 'Official ICPC coach for six teams preparing for ICPC 2026.' },
    { time: '2025', text: 'First place, Nile University Competitive Programming Arena.' },
    { time: '2025', text: 'ECPC: 129th of 1,734 participants, 4th among 80+ university teams.' },
    { time: 'Peak', text: 'Codeforces Specialist rank after 50+ rated contests.' },
];

export default function About() {
    useDocumentMeta(
        'About — Mwafak Almahaini',
        'Projects, live GitHub activity, and a competitive programming record from Mwafak Almahaini, full-stack software engineer.',
    );
    const [githubActivity, setGithubActivity] = useState<GitHubActivityResponse | null>(null);

    useEffect(() => {
        if (window.location.hash === '#social') {
            document.getElementById('social')?.scrollIntoView();
        }
    }, []);

    useEffect(() => {
        let live = true;
        (async () => {
            try {
                const [activity, ok] = await apiRequest<GitHubActivityResponse>('/github-activity');
                if (live && ok && Array.isArray(activity.projects)) setGithubActivity(activity);
            } catch {
                // GitHub activity degrades to silence when unavailable.
            }
        })();
        return () => {
            live = false;
        };
    }, []);

    const activityBySlug = new Map(githubActivity?.projects.map((activity) => [activity.slug, activity]) ?? []);

    return (
        <>
            <Hero />

            <section id="projects" className="wrapper scroll-mt-20 py-24 sm:py-28">
                <Reveal className="mb-12 max-w-2xl">
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">Things I've built</h2>
                </Reveal>

                <RevealGroup className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredProjects.map((project) => (
                        <RevealItem key={project.slug}>
                            <ProjectCard project={project} activity={activityBySlug.get(project.slug)} />
                        </RevealItem>
                    ))}
                </RevealGroup>

                {listedProjects.length > 0 && (
                    <div className="mt-16 max-w-3xl sm:mt-20">
                        <h3 className="font-mono-ui text-sm font-semibold text-(--text-tertiary)">More shipped</h3>
                        <RevealGroup className="mt-6 divide-y divide-(--border-subtle)">
                            {listedProjects.map((project) => (
                                <RevealItem key={project.slug} className="py-7">
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="font-display text-lg font-bold">
                                            <a
                                                href={project.live ?? project.repo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-(--accent)"
                                            >
                                                {project.name}
                                            </a>
                                        </h4>
                                        <StarCount activity={activityBySlug.get(project.slug)} />
                                    </div>
                                    <p className="mt-1.5 text-(--text-secondary)">{project.tagline}</p>
                                    <div className="font-mono-ui mt-3 flex flex-wrap gap-1.5">
                                        {project.stack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="rounded border border-(--border-subtle) px-1.5 py-0.5 text-[11px] text-(--text-tertiary)"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <ActivityLine activity={activityBySlug.get(project.slug)} />
                                    <div className="font-mono-ui mt-3 flex gap-5 text-sm font-semibold">
                                        {project.live && (
                                            <a
                                                href={project.live}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-(--accent) transition-colors hover:text-(--accent-strong)"
                                            >
                                                Live →
                                            </a>
                                        )}
                                        <a
                                            href={project.repo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                                        >
                                            Source
                                        </a>
                                    </div>
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    </div>
                )}
            </section>

            <section id="open-source" className="wrapper scroll-mt-20 border-t border-(--border-subtle) py-24 sm:py-28">
                <Reveal className="mb-12 max-w-2xl">
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">Open Source</h2>
                    <p className="mt-3 text-(--text-secondary)">Merged pull requests to projects I don't maintain.</p>
                </Reveal>

                <OpenSourceContributions />
            </section>

            <section
                id="problem-solving"
                className="wrapper scroll-mt-20 border-t border-(--border-subtle) py-24 sm:py-28"
            >
                <Reveal className="mb-12 max-w-2xl">
                    <h2 className="font-display flex items-center gap-3 text-3xl font-bold sm:text-4xl">
                        <SiCodeforces className="codeforces-rank text-2xl sm:text-3xl" aria-hidden="true" />
                        Problem Solving
                    </h2>
                    <p className="mt-3 text-(--text-secondary)">
                        Live from{' '}
                        <a
                            href="https://codeforces.com/profile/SuperMo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="codeforces-rank font-semibold"
                        >
                            Codeforces
                        </a>
                        .
                    </p>
                </Reveal>

                <Reveal className="surface-panel p-6 sm:p-8">
                    <RatingChart />
                </Reveal>

                <RevealGroup as="ol" className="mt-10 grid gap-6 sm:grid-cols-2">
                    {ACHIEVEMENTS.map((achievement) => (
                        <RevealItem as="li" key={achievement.text} className="grid grid-cols-[3.5rem_1fr] gap-x-5">
                            <span className="font-mono-ui text-sm font-semibold text-(--text-tertiary) tabular-nums">
                                {achievement.time}
                            </span>
                            <p className="leading-relaxed text-pretty">{achievement.text}</p>
                        </RevealItem>
                    ))}
                </RevealGroup>

                <Reveal className="mt-8">
                    <a
                        href="https://icpc.global/ICPCID/79DMQL058TAV"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-ui inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--accent)"
                    >
                        <GoTrophy aria-hidden="true" /> ICPC global profile →
                    </a>
                </Reveal>
            </section>

            <section id="social" className="wrapper scroll-mt-24 border-t border-(--border-subtle) py-24 sm:py-28">
                <Reveal>
                    <h2 className="font-display text-center text-3xl font-bold sm:text-4xl">Let's connect</h2>
                </Reveal>

                <RevealGroup className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
                    <RevealItem>
                        <SocialLink
                            href="https://www.linkedin.com/in/mowafk-mha/"
                            icon={<FaLinkedin />}
                            label="LinkedIn"
                        />
                    </RevealItem>
                    <RevealItem>
                        <SocialLink href="https://github.com/SuperMo0" icon={<FaGithub />} label="GitHub" />
                    </RevealItem>
                    <RevealItem>
                        <SocialLink
                            href="https://codeforces.com/profile/SuperMo"
                            icon={<SiCodeforces />}
                            label="Codeforces"
                        />
                    </RevealItem>
                </RevealGroup>
            </section>
        </>
    );
}
