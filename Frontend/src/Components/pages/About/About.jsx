import React, { useEffect, useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiCodeforces } from 'react-icons/si';
import SocialLink from '../../Social-Link/SocialLink';
import projects from '../../../data/projects';
import apiRequest from '../../../utils/Api';

const featuredProjects = projects.filter((project) => project.featured);
const listedProjects = projects.filter((project) => !project.featured);

function ProjectLinks({ project }) {
    return (
        <div className="font-interface flex gap-4 text-sm font-semibold">
            {project.live && (
                <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--accent) transition-colors hover:text-(--accent-hover)"
                >
                    Live site
                </a>
            )}
            <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--text-primary) transition-colors hover:text-(--accent)"
            >
                Source
            </a>
        </div>
    );
}

function formatActivityDate(value) {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function ProjectActivity({ activity }) {
    if (!activity) return null;

    const lastActivity = formatActivityDate(activity.lastActivityAt);
    const commitLabel = activity.commits === 1 ? 'commit' : 'commits';

    return (
        <p className="project-activity font-interface text-xs text-(--text-secondary)">
            {activity.commits.toLocaleString()} authored {commitLabel}
            {lastActivity && <> · last activity {lastActivity}</>}
        </p>
    );
}

function ProjectDetails({ project, activity }) {
    return (
        <div>
            <h3 className="text-xl font-bold leading-tight">
                {project.name}
                {project.teamNote && (
                    <span className="font-interface ml-2 text-sm font-normal text-(--text-secondary)">
                        — {project.teamNote}
                    </span>
                )}
            </h3>
            <p className="mt-2 leading-relaxed text-(--text-secondary)">{project.tagline}</p>
            <p className="font-interface mt-3 text-xs leading-relaxed tracking-wide text-(--text-secondary)">
                {project.stack.join(' · ')}
            </p>
            <div className="mt-3">
                <ProjectLinks project={project} />
            </div>
            <ProjectActivity activity={activity} />
        </div>
    );
}

export default function About() {
    const [githubActivity, setGithubActivity] = useState(null);

    useEffect(() => {
        if (window.location.hash === '#social') {
            document.getElementById('social')?.scrollIntoView();
        }
    }, []);

    useEffect(() => {
        let shouldApplyActivityResult = true;

        async function loadGitHubActivity() {
            try {
                const [activity, ok] = await apiRequest('/github-activity');
                if (
                    shouldApplyActivityResult
                    && ok
                    && Number.isFinite(activity.totalCommits)
                    && Array.isArray(activity.projects)
                ) {
                    setGithubActivity(activity);
                }
            } catch {
                // The figures are an enhancement; the portfolio remains complete without them.
            }
        }

        loadGitHubActivity();

        return () => {
            shouldApplyActivityResult = false;
        };
    }, []);

    const activityBySlug = new Map(
        githubActivity?.projects.map((activity) => [activity.slug, activity]) ?? [],
    );

    return (
        <div className="wrapper max-w-6xl py-16 sm:py-20">
            <section aria-labelledby="about-heading">
                <div className="flex flex-col items-center gap-10 md:flex-row md:gap-14">
                    <div className="shrink-0">
                        <img
                            src="/images/mowafak-almahaini.webp"
                            width="640"
                            height="640"
                            className="h-48 w-48 rounded-full object-cover md:h-72 md:w-72"
                            alt="Mowafak Almahaini"
                        />
                    </div>

                    <div className="max-w-2xl text-center md:text-left">
                        <p className="font-interface mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-(--text-primary)">
                            About
                        </p>
                        <h1 id="about-heading" className="text-4xl font-bold leading-tight sm:text-5xl">
                            Hi, I’m <span className="text-(--accent)">Mowafak</span>.
                        </h1>
                        <p className="mt-6 text-lg leading-relaxed text-(--text-secondary)">
                            I built this blog to document my journey in software engineering. I completed{' '}
                            <span className="font-semibold text-(--text-primary)">The Odin Project</span> curriculum,
                            where I created more than 20 full-stack projects. I recently joined{' '}
                            <span className="font-semibold text-(--text-primary)">SYNC</span>, and I’m currently working
                            with its software engineering team.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-(--text-secondary)">
                            I work with React, TypeScript, and Python, with a focus on practical AI integrations.
                        </p>
                        <p className="mt-4 text-lg leading-relaxed text-(--text-secondary)">
                            I love problem-solving! I reached{' '}
                            <strong className="codeforces-rank">Specialist</strong> on Codeforces and participated
                            in the ECPC programming contest (solving 6/13 problems). I am currently pursuing the
                            Expert rank.
                        </p>
                    </div>
                </div>
            </section>

            <section aria-labelledby="work-heading" className="pt-24 sm:pt-28">
                <div className="mb-10 max-w-2xl">
                    <h2 id="work-heading" className="text-3xl font-bold sm:text-4xl">Things I’ve built</h2>
                </div>

                <div className="grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredProjects.map((project) => (
                        <article
                            key={project.slug}
                            className="project-entry relative transition-transform duration-300 hover:scale-[1.02]"
                        >
                            <a
                                href={project.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${project.name}`}
                            >
                                <img
                                    src={project.cover}
                                    alt={project.coverAlt}
                                    width={project.coverWidth}
                                    height={project.coverHeight}
                                    className="aspect-video w-full rounded-lg object-cover"
                                />
                            </a>
                            <div className="mt-5">
                                <ProjectDetails
                                    project={project}
                                    activity={activityBySlug.get(project.slug)}
                                />
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-16 max-w-3xl space-y-9 sm:mt-20">
                    {listedProjects.map((project) => (
                        <article
                            key={project.slug}
                            className="project-entry relative transition-transform duration-300 hover:scale-[1.02]"
                        >
                            <ProjectDetails
                                project={project}
                                activity={activityBySlug.get(project.slug)}
                            />
                        </article>
                    ))}
                </div>

                <div className="mt-16 max-w-4xl">
                    {githubActivity && (
                        <p className="font-interface max-w-3xl text-sm leading-relaxed text-(--text-secondary)">
                            Across these {githubActivity.projects.length} projects, I’ve authored{' '}
                            {githubActivity.totalCommits.toLocaleString()} commits, according to{' '}
                            <a
                                href="https://github.com/SuperMo0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-(--text-primary) transition-colors hover:text-(--accent)"
                            >
                                GitHub
                            </a>.
                        </p>
                    )}
                    <a
                        href="https://github.com/SuperMo0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 block transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <img
                            src="/images/github-contributions.webp"
                            alt="Mowafak Almahaini's GitHub contribution history and activity overview"
                            width="965"
                            height="584"
                            className="w-full rounded-lg"
                            loading="lazy"
                        />
                    </a>
                </div>
            </section>

            <section aria-labelledby="competitive-heading" className="pt-24 sm:pt-28">
                <div className="mb-10 max-w-2xl">
                    <h2 id="competitive-heading" className="text-3xl font-bold sm:text-4xl">
                        Competitive programming
                    </h2>
                </div>

                <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14">
                    <ol className="space-y-7">
                        <li className="grid grid-cols-[4rem_1fr] gap-4">
                            <time className="font-interface text-sm font-semibold text-(--text-secondary)">2026</time>
                            <p className="leading-relaxed">Official ICPC coach for six teams preparing for ICPC 2026.</p>
                        </li>
                        <li className="grid grid-cols-[4rem_1fr] gap-4">
                            <time className="font-interface text-sm font-semibold text-(--text-secondary)">2025</time>
                            <p className="leading-relaxed">First place in the Nile University Competitive Programming Arena.</p>
                        </li>
                        <li className="grid grid-cols-[4rem_1fr] gap-4">
                            <time className="font-interface text-sm font-semibold text-(--text-secondary)">2025</time>
                            <p className="leading-relaxed">ECPC: 129th of 1,734 participants and fourth among 80+ university teams.</p>
                        </li>
                        <li className="grid grid-cols-[4rem_1fr] gap-4">
                            <span className="font-interface text-sm font-semibold text-(--text-secondary)">Peak</span>
                            <p className="leading-relaxed">
                                Codeforces <strong className="codeforces-rank">Specialist</strong> after 50+ contests.
                            </p>
                        </li>
                    </ol>

                    <a
                        href="https://codeforces.com/profile/SuperMo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <img
                            src="/images/codeforces.webp"
                            alt="Mowafak Almahaini's Codeforces problem-solving history"
                            width="1000"
                            height="532"
                            className="w-full rounded-lg"
                            loading="lazy"
                        />
                    </a>
                </div>
            </section>

            <section id="social" aria-labelledby="social-heading" className="scroll-mt-24 pt-24 sm:pt-28">
                <div className="text-center">
                    <p className="font-interface mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-(--text-primary)">
                        Find me online
                    </p>
                    <h2 id="social-heading" className="text-3xl font-bold sm:text-4xl">Let’s connect</h2>
                </div>

                <div className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-4 text-center sm:grid-cols-3 sm:gap-8">
                    <SocialLink
                        href="https://www.linkedin.com/in/mowafk-mha/"
                        icon={<FaLinkedin />}
                        label="LinkedIn"
                        color="text-blue-600"
                    />
                    <SocialLink
                        href="https://github.com/SuperMo0"
                        icon={<FaGithub />}
                        label="GitHub"
                        color="text-(--text-primary)"
                    />
                    <SocialLink
                        href="https://codeforces.com/profile/SuperMo"
                        icon={<SiCodeforces />}
                        label="Codeforces"
                        color="text-red-500"
                    />
                </div>
            </section>
        </div>
    );
}
