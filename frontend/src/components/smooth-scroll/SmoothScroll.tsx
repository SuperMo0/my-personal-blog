import Lenis from 'lenis';
import { useEffect } from 'react';

export default function SmoothScroll() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1 - 2 ** (-10 * t)),
        });

        let frameId = requestAnimationFrame(function raf(time) {
            lenis.raf(time);
            frameId = requestAnimationFrame(raf);
        });

        return () => {
            cancelAnimationFrame(frameId);
            lenis.destroy();
        };
    }, []);

    return null;
}
