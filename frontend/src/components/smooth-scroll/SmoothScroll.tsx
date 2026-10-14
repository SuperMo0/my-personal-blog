import Lenis from 'lenis';
import { useEffect } from 'react';

export default function SmoothScroll() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1 - 2 ** (-10 * t)),
        });

        // Only run the frame loop while Lenis is animating a wheel scroll, so an idle page
        // isn't redrawing at 60fps forever.
        let frameId = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            frameId = lenis.isScrolling === 'smooth' ? requestAnimationFrame(raf) : 0;
        };

        // Capture phase runs before Lenis's own wheel handler, so its clock is reset before the
        // scroll starts; otherwise the time spent asleep would count as one huge first frame.
        const wake = () => {
            if (frameId) return;
            lenis.raf(performance.now());
            frameId = requestAnimationFrame(raf);
        };
        window.addEventListener('wheel', wake, { capture: true, passive: true });

        return () => {
            window.removeEventListener('wheel', wake, { capture: true });
            cancelAnimationFrame(frameId);
            lenis.destroy();
        };
    }, []);

    return null;
}
