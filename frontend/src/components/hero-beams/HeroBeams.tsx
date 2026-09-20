import { useEffect, useRef } from 'react';

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    pulse: number;
    pulseSpeed: number;
    layer: number;
}

const LAYERS = 3;
const BEAMS_PER_LAYER = 6;

function createBeam(width: number, height: number, layer: number): Beam {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        width: 50 + layer * 34,
        length: height * 2.2,
        angle,
        speed: 0.15 + layer * 0.12 + Math.random() * 0.15,
        opacity: 0.07 + layer * 0.045 + Math.random() * 0.05,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.012,
        layer,
    };
}

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const value = parseInt(
        clean.length === 3
            ? clean
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : clean,
        16,
    );
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export default function HeroBeams() {
    const containerRef = useRef<HTMLDivElement>(null);
    const beamCanvasRef = useRef<HTMLCanvasElement>(null);
    const noiseCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = beamCanvasRef.current;
        const noiseCanvas = noiseCanvasRef.current;
        if (!container || !canvas || !noiseCanvas) return;

        const ctx = canvas.getContext('2d');
        const nCtx = noiseCanvas.getContext('2d');
        if (!ctx || !nCtx) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0969da';
        const [r, g, b] = hexToRgb(accentHex);

        let beams: Beam[] = [];
        let width = 0;
        let height = 0;
        const NOISE_SCALE = 0.4;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = container.clientWidth;
            height = container.clientHeight;
            if (width === 0 || height === 0) return;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            noiseCanvas.width = Math.round(width * NOISE_SCALE);
            noiseCanvas.height = Math.round(height * NOISE_SCALE);
            noiseCanvas.style.width = `${width}px`;
            noiseCanvas.style.height = `${height}px`;

            beams = [];
            for (let layer = 1; layer <= LAYERS; layer += 1) {
                for (let i = 0; i < BEAMS_PER_LAYER; i += 1) {
                    beams.push(createBeam(width, height, layer));
                }
            }
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
        resize();

        const drawBeam = (beam: Beam) => {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsing = Math.min(1, beam.opacity * (0.75 + Math.sin(beam.pulse) * 0.45));
            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
            gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
            gradient.addColorStop(0.2, `rgba(${r},${g},${b},${pulsing * 0.5})`);
            gradient.addColorStop(0.5, `rgba(${r},${g},${b},${pulsing})`);
            gradient.addColorStop(0.8, `rgba(${r},${g},${b},${pulsing * 0.5})`);
            gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

            ctx.fillStyle = gradient;
            ctx.filter = `blur(${4 + beam.layer * 3}px)`;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        };

        const generateNoise = () => {
            const w = noiseCanvas.width;
            const h = noiseCanvas.height;
            if (w === 0 || h === 0) return;
            const imgData = nCtx.createImageData(w, h);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 255;
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
                data[i + 3] = 22;
            }
            nCtx.putImageData(imgData, 0, 0);
        };

        let frameId = 0;
        let frameCount = 0;
        let visible = true;

        const animate = () => {
            if (width === 0 || height === 0) return;
            ctx.clearRect(0, 0, width, height);

            beams.forEach((beam) => {
                beam.y -= beam.speed * (beam.layer / LAYERS + 0.4);
                beam.pulse += beam.pulseSpeed;
                if (beam.y + beam.length < -50) {
                    beam.y = height + 50;
                    beam.x = Math.random() * width;
                }
                drawBeam(beam);
            });

            frameCount += 1;
            if (frameCount % 3 === 0) generateNoise();

            if (!reduceMotion && visible) {
                frameId = requestAnimationFrame(animate);
            }
        };

        const onVisibilityChange = () => {
            visible = document.visibilityState === 'visible';
            if (visible && !reduceMotion && !frameId) {
                frameId = requestAnimationFrame(animate);
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        if (reduceMotion) {
            beams.forEach(drawBeam);
            generateNoise();
        } else {
            frameId = requestAnimationFrame(animate);
        }

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);

    return (
        <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <canvas ref={beamCanvasRef} className="absolute inset-0" />
            <canvas
                ref={noiseCanvasRef}
                style={{ imageRendering: 'pixelated' }}
                className="absolute inset-0 opacity-70 mix-blend-overlay"
            />
        </div>
    );
}
