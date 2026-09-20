import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export const staggerContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

type Tag = 'div' | 'ol' | 'ul' | 'li';

interface RevealProps {
    children: ReactNode;
    className?: string;
    as?: Tag;
}

export default function Reveal({ children, className, as = 'div' }: RevealProps) {
    const MotionTag = motion[as];
    return (
        <MotionTag
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className={className}
        >
            {children}
        </MotionTag>
    );
}

export function RevealGroup({ children, className, as = 'div' }: RevealProps) {
    const MotionTag = motion[as];
    return (
        <MotionTag
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className={className}
        >
            {children}
        </MotionTag>
    );
}

export function RevealItem({ children, className, as = 'div' }: RevealProps) {
    const MotionTag = motion[as];
    return (
        <MotionTag variants={fadeUp} className={className}>
            {children}
        </MotionTag>
    );
}
