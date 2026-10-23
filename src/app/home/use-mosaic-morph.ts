"use client";

import { RefObject, useEffect } from "react";
import { centroid, lerpCell, mix, morphCells, Point, rounded } from "@/core/style/mosaic";

export type MorphTiming = { holdCross: number; holdB: number; morph: number };

/** Always in motion: a short rest on each shape, then on to the other; the B comes first */
export const defaultTiming: MorphTiming = { holdCross: 3_000, holdB: 3_500, morph: 3_200 };

const CELL_SHARE = 0.6; // of the morph window that each stone spends moving; the rest staggers them out from the heart
const glide = (t: number) => (1 - Math.cos(Math.PI * t)) / 2; // gentle at both ends
const clamp = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Each stone's flight: it closes to a star, travels, then opens; these are where it starts and stops travelling */
const CLOSE = 0.3, OPEN = 0.7;
/** A star's size, as a share of its stone's */
const STAR = 0.12;
/** How far (radians) a travelling star curves round the centre, and how far (emblem units) it bows outward */
const SWIRL = 0.45, ARC = 4;
const REST = 0.7; // the glow's resting strength; it rises to full while the stars travel
const CENTRE: Point = [30, 48];

/**
 * Drives the emblem between cross and B as a constellation, writing straight to the SVG: each cell's paths (one per
 * layer, marked `data-cell`), their shape, and the coloured layers' colour (`data-colour`). Out from the heart, each
 * stone closes to a point of light, the stars sweep on a gentle curve to their new places (changing colour on the way;
 * the B's extra stars merge into the cross's), and each opens into its new stone, heart first. The glow swells while
 * they travel. Starts on the B, as rendered. Pauses off-screen and in hidden tabs; under reduced motion the B stays still.
 */
export function useMosaicMorph(root: RefObject<HTMLElement | null>, timing: MorphTiming = defaultTiming) {
    useEffect(() => {
        const element = root.current;
        if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const layers = morphCells.map((_, k) => Array.from(element.querySelectorAll<SVGPathElement>(`[data-cell="${k}"]`)));
        const bloom = element.querySelector<SVGGElement>("[data-bloom]");

        /** The emblem `progress` of the way from cross (0) to B (1), heading for the cross or the B */
        const draw = (progress: number, toCross: boolean) => {
            morphCells.forEach((cell, k) => {
                // the heart leads either way
                const lead = toCross ? 1 - cell.stagger : cell.stagger;
                const local = clamp((progress - lead * (1 - CELL_SHARE)) / CELL_SHARE);
                const travel = glide(clamp((local - CLOSE) / (OPEN - CLOSE)));
                const size = local < CLOSE ? 1 - (1 - STAR) * glide(local / CLOSE)
                    : local > OPEN ? STAR + (1 - STAR) * glide((local - OPEN) / (1 - OPEN)) : STAR;

                const shape = lerpCell(cell, travel);
                const [cx, cy] = centroid(shape);
                const flight = Math.sin(Math.PI * travel);
                const length = Math.hypot(cx - CENTRE[0], cy - CENTRE[1]) || 1;
                const [cos, sin] = [Math.cos(flight * SWIRL), Math.sin(flight * SWIRL)];
                const [rx, ry] = [cx - CENTRE[0], cy - CENTRE[1]];
                const [sx, sy] = [CENTRE[0] + rx * cos - ry * sin + rx / length * flight * ARC, CENTRE[1] + rx * sin + ry * cos + ry / length * flight * ARC];
                const d = rounded(shape.map(([x, y]) => [sx + (x - cx) * size, sy + (y - cy) * size] as Point), 1.3 * size);

                const colour = mix(cell.colour.cross, cell.colour.b, travel);
                const opacity = cell.extra ? travel.toFixed(3) : "1";
                layers[k].forEach(path => {
                    path.setAttribute("d", d);
                    path.setAttribute("opacity", opacity);
                    if (path.hasAttribute("data-colour")) { path.setAttribute("fill", colour); path.setAttribute("stroke", colour); }
                });
            });
            bloom?.setAttribute("opacity", (REST + (1 - REST) * Math.sin(Math.PI * ease(progress))).toFixed(3));
        };

        // Phases (0 is the cross, 1 the B): hold the B, morph to the cross, hold the cross, morph back
        const phases = [
            { duration: timing.holdB },
            { duration: timing.morph, from: 1, to: 0 },
            { duration: timing.holdCross },
            { duration: timing.morph, from: 0, to: 1 },
        ];
        let phase = 0, elapsed = 0, last = 0;
        let frame = 0, timer: ReturnType<typeof setTimeout> | undefined, running = false;
        let onScreen = true;

        const next = () => { phase = (phase + 1) % phases.length; elapsed = 0; run(); };
        const tick = (now: number) => {
            const { duration, from, to } = phases[phase];
            elapsed += Math.min(now - last, 64); // never jump after a stall
            last = now;
            const t = clamp(elapsed / duration);
            draw(from! + (to! - from!) * t, to === 0);
            if (t < 1) frame = requestAnimationFrame(tick);
            else next();
        };
        const run = () => {
            if (!running) return;
            const { duration, from } = phases[phase];
            if (from === undefined) {
                const started = performance.now() - elapsed;
                timer = setTimeout(() => { elapsed = performance.now() - started; next(); }, duration - elapsed);
                last = started; // remembered so a pause can measure the hold so far
            } else {
                last = performance.now();
                frame = requestAnimationFrame(tick);
            }
        };
        const pause = () => {
            if (!running) return;
            running = false;
            if (timer) { clearTimeout(timer); elapsed = performance.now() - last; timer = undefined; }
            cancelAnimationFrame(frame);
        };
        const update = () => {
            const visible = onScreen && document.visibilityState === "visible";
            if (visible && !running) { running = true; run(); }
            else if (!visible) pause();
        };

        const observer = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; update(); });
        observer.observe(element);
        document.addEventListener("visibilitychange", update);
        update();

        return () => {
            pause();
            observer.disconnect();
            document.removeEventListener("visibilitychange", update);
        };
    }, [root, timing]);
}
