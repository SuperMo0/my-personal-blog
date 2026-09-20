import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router';
import CommitHeatmap from '../commit-heatmap/CommitHeatmap';
import HeroBeams from '../hero-beams/HeroBeams';

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
                        className="mb-5 h-32 w-32 rounded-full border border-(--border-strong) object-cover sm:h-40 sm:w-40"
                    />

                    <motion.h1
                        variants={item}
                        className="font-display whitespace-nowrap text-3xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.4rem]"
                    >
                        <span className="text-(--accent)">Mwafak</span> Almahaini
                    </motion.h1>

                    <motion.p variants={item} className="font-display mt-3 text-lg text-(--text-secondary) sm:text-xl">
                        Full-stack software engineer, Dubai, UAE.
                    </motion.p>

                    <motion.p
                        variants={item}
                        className="mt-4 max-w-2xl text-base leading-relaxed text-(--text-secondary) sm:text-lg"
                    >
                        I started my full-stack journey with{' '}
                        <a
                            href="https://www.theodinproject.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="odin-link"
                        >
                            The Odin Project
                        </a>{' '}
                        curriculum. I recently joined{' '}
                        <a
                            href="https://www.linkedin.com/company/sync-sv/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sync-link"
                        >
                            SYNC
                        </a>
                        , and I'm currently working with its software engineering team on an AI powered recruiting
                        platform.
                    </motion.p>

                    <motion.p
                        variants={item}
                        className="mt-3 max-w-2xl text-base leading-relaxed text-(--text-secondary) sm:text-lg"
                    >
                        I work with React, TypeScript, Node.js, and Python, with a focus on practical AI integrations.
                    </motion.p>

                    <motion.p
                        variants={item}
                        className="mt-3 max-w-2xl text-base leading-relaxed text-(--text-secondary) sm:text-lg"
                    >
                        I love problem-solving! I reached{' '}
                        <strong className="codeforces-rank font-semibold">Specialist</strong> on Codeforces. I have been
                        an ICPC contestant, and I am currently pursuing the Expert rank.
                    </motion.p>

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
                    className="surface-panel bg-(--surface)/75 p-5 backdrop-blur-xl sm:p-7"
                >
                    <p className="font-mono-ui mb-5 text-xs text-(--text-tertiary)">github.com/SuperMo0</p>
                    <CommitHeatmap />
                </motion.div>
            </div>
        </section>
    );
}
