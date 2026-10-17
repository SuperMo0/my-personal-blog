import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router';
import CommitHeatmap from '../commit-heatmap/CommitHeatmap';
import HeroBeams from '../hero-beams/HeroBeams';

const STACK = ['React', 'TypeScript', 'Node.js', 'Python'];

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-(--border-subtle)">
            <div className="absolute inset-0">
                <HeroBeams />
            </div>

            <div className="wrapper relative grid grid-cols-1 gap-12 py-12 sm:py-16 lg:grid-cols-[1.35fr_0.85fr] lg:items-center lg:py-20">
                <motion.div variants={container} initial="hidden" animate="show">
                    <motion.img
                        variants={item}
                        src="/images/mwafak-almahaini.webp"
                        alt="Mwafak Almahaini"
                        width={640}
                        height={640}
                        className="mb-6 h-40 w-40 rounded-full border border-(--border-strong) object-cover sm:h-52 sm:w-52 lg:h-56 lg:w-56"
                    />

                    <motion.h1
                        variants={item}
                        className="font-display whitespace-nowrap text-3xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.4rem]"
                    >
                        <span className="text-(--accent)">Mwafak</span> Almahaini
                    </motion.h1>

                    <motion.p variants={item} className="font-display mt-3 text-lg text-(--text-secondary) sm:text-xl">
                        Full-stack software engineer, Damascus, Syria.
                    </motion.p>

                    <motion.p
                        variants={item}
                        className="mt-4 max-w-2xl text-base leading-relaxed text-(--text-secondary) sm:text-lg"
                    >
                        Recently joined{' '}
                        <a
                            href="https://www.linkedin.com/company/sync-sv/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sync-link"
                        >
                            SYNC
                        </a>
                        's engineering team, building an AI-powered recruiting platform with a focus on practical AI
                        integrations. I started out with{' '}
                        <a
                            href="https://www.theodinproject.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="odin-link"
                        >
                            The Odin Project
                        </a>
                        .
                    </motion.p>

                    <motion.p
                        variants={item}
                        className="mt-3 max-w-2xl text-base leading-relaxed text-(--text-secondary) sm:text-lg"
                    >
                        I love problem solving: <strong className="codeforces-rank font-semibold">Specialist</strong> on
                        Codeforces, former ICPC contestant, now chasing Expert.
                    </motion.p>

                    <motion.p
                        variants={item}
                        className="mt-3 max-w-2xl text-base leading-relaxed text-(--text-secondary) sm:text-lg"
                    >
                        I'm open to collaborating, so feel free to{' '}
                        <a href="#social" className="odin-link">
                            reach out
                        </a>
                        .
                    </motion.p>

                    <motion.ul variants={item} className="font-mono-ui mt-5 flex flex-wrap gap-2" aria-label="Stack">
                        {STACK.map((tech) => (
                            <li
                                key={tech}
                                className="rounded-md border border-(--border-subtle) bg-(--surface)/60 px-2.5 py-1 text-xs text-(--text-secondary)"
                            >
                                {tech}
                            </li>
                        ))}
                    </motion.ul>

                    <motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-4">
                        <a href="#projects" className="btn-primary">
                            See what I've built ↓
                        </a>
                        <Link to="/cv" className="btn-ghost">
                            Download CV
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="surface-panel bg-(--surface)/90 p-5 sm:p-7"
                >
                    <p className="font-mono-ui mb-5 text-xs text-(--text-tertiary)">github.com/SuperMo0</p>
                    <CommitHeatmap />
                </motion.div>
            </div>
        </section>
    );
}
