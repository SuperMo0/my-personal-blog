import { useEffect, useRef } from 'react';

interface Beam {
    x: number;
    y: number;
    angle: number;
    speed: number;
    opacity: number;
    pulse: number;
    pulseSpeed: number;
    layer: number;
}

interface Sprite {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    pad: number;
}

const LAYERS = 3;
const BEAMS_PER_LAYER = 6;
// The beams are pure blur, so a quarter-resolution canvas upscaled by CSS looks the same
// while filling 1/16th of the pixels (1/64th on a 2x screen).
const RENDER_SCALE = 0.25;
// The drift is slow enough that 24fps reads as smooth, at well under half the work of 60.
const FRAME_INTERVAL = 1000 / 24;
const NOISE_TILE = 128;
const NOISE_PIXEL = 2.5;

// Weak phones and laptops get a still frame: the drift is slow enough that it reads the same.
function isLowEndDevice() {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    return (
        (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
        (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
        nav.connection?.saveData === true
    );
}

const beamWidth = (layer: number) => 50 + layer * 34;
const beamBlur = (layer: number) => 4 + layer * 3;

function createBeam(width: number, height: number, layer: number): Beam {
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        angle: ((-35 + Math.random() * 10) * Math.PI) / 180,
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

// Blurring is the expensive part, so each layer's beam is blurred once into a sprite and
// every frame only stamps the sprites with a per-beam alpha.
function createSprite(layer: number, length: number, rgb: [number, number, number]): Sprite | null {
    const width = beamWidth(layer);
    const blur = beamBlur(layer);
    const pad = blur * 3;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil((width + pad * 2) * RENDER_SCALE);
    canvas.height = Math.ceil((length + pad * 2) * RENDER_SCALE);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const [r, g, b] = rgb;
    ctx.scale(RENDER_SCALE, RENDER_SCALE);
    const gradient = ctx.createLinearGradient(0, pad, 0, pad + length);
    gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
    gradient.addColorStop(0.2, `rgba(${r},${g},${b},0.5)`);
    gradient.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
    gradient.addColorStop(0.8, `rgba(${r},${g},${b},0.5)`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gradient;
    ctx.filter = `blur(${blur * RENDER_SCALE}px)`;
    ctx.fillRect(pad, pad, width, length);

    return { canvas, width: width + pad * 2, height: length + pad * 2, pad };
}

let noiseTileUrl: string | null = null;

function getNoiseTile(): string | null {
    if (noiseTileUrl) return noiseTileUrl;
    const canvas = document.createElement('canvas');
    canvas.width = NOISE_TILE;
    canvas.height = NOISE_TILE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const imgData = ctx.createImageData(NOISE_TILE, NOISE_TILE);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 22;
    }
    ctx.putImageData(imgData, 0, 0);
    noiseTileUrl = canvas.toDataURL();
    return noiseTileUrl;
}

export default function HeroBeams() {
    const containerRef = useRef<HTMLDivElement>(null);
    const beamCanvasRef = useRef<HTMLCanvasElement>(null);
    const noiseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = beamCanvasRef.current;
        const noise = noiseRef.current;
        if (!container || !canvas || !noise) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const tile = getNoiseTile();
        if (tile) noise.style.backgroundImage = `url(${tile})`;

        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || isLowEndDevice();

        let beams: Beam[] = [];
        let sprites: (Sprite | null)[] = [];
        let width = 0;
        let height = 0;

        const buildSprites = () => {
            const accentHex =
                getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0969da';
            const rgb = hexToRgb(accentHex);
            sprites = [];
            for (let layer = 1; layer <= LAYERS; layer += 1) {
                sprites[layer] = createSprite(layer, height * 2.2, rgb);
            }
        };

        const draw = () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const beam of beams) {
                const sprite = sprites[beam.layer];
                if (!sprite) continue;
                ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
                ctx.translate(beam.x, beam.y);
                ctx.rotate(beam.angle);
                ctx.globalAlpha = Math.min(1, beam.opacity * (0.75 + Math.sin(beam.pulse) * 0.45));
                ctx.drawImage(sprite.canvas, -sprite.width / 2, -sprite.pad, sprite.width, sprite.height);
            }
            ctx.globalAlpha = 1;
        };

        const resize = () => {
            const nextWidth = container.clientWidth;
            const nextHeight = container.clientHeight;
            if (nextWidth === 0 || nextHeight === 0) return;
            if (nextWidth === width && nextHeight === height) return;
            width = nextWidth;
            height = nextHeight;

            canvas.width = Math.ceil(width * RENDER_SCALE);
            canvas.height = Math.ceil(height * RENDER_SCALE);

            beams = [];
            for (let layer = 1; layer <= LAYERS; layer += 1) {
                for (let i = 0; i < BEAMS_PER_LAYER; i += 1) {
                    beams.push(createBeam(width, height, layer));
                }
            }
            buildSprites();
            draw();
        };

        let frameId = 0;
        let lastTime = 0;
        let onScreen = true;

        const animate = (time: number) => {
            frameId = requestAnimationFrame(animate);
            if (time - lastTime < FRAME_INTERVAL) return;
            // Step by elapsed time so the speed matches the old 60fps loop on any refresh rate.
            const steps = lastTime ? Math.min((time - lastTime) / (1000 / 60), 6) : 1;
            lastTime = time;

            for (const beam of beams) {
                beam.y -= beam.speed * (beam.layer / LAYERS + 0.4) * steps;
                beam.pulse += beam.pulseSpeed * steps;
                if (beam.y + height * 2.2 < -50) {
                    beam.y = height + 50;
                    beam.x = Math.random() * width;
                }
            }
            draw();
        };

        const start = () => {
            if (still || frameId || !onScreen || document.visibilityState !== 'visible') return;
            lastTime = 0;
            frameId = requestAnimationFrame(animate);
        };

        const stop = () => {
            cancelAnimationFrame(frameId);
            frameId = 0;
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
        resize();

        // Only animate while the hero is actually on screen.
        const intersectionObserver = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            if (onScreen) start();
            else stop();
        });
        intersectionObserver.observe(container);

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') start();
            else stop();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Recolor the beams when the theme flips.
        const themeObserver = new MutationObserver(() => {
            buildSprites();
            draw();
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-dark'] });

        start();

        return () => {
            stop();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            themeObserver.disconnect();
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);

    return (
        <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <canvas ref={beamCanvasRef} className="absolute inset-0 h-full w-full" />
            <div
                ref={noiseRef}
                style={{ imageRendering: 'pixelated', backgroundSize: `${NOISE_TILE * NOISE_PIXEL}px` }}
                className="absolute inset-0 opacity-70 mix-blend-overlay"
            />
        </div>
    );
}
