"use client";

import { RefObject, useEffect } from "react";
import { gradients, lerpCell, morphCells, rounded } from "@/app/home/mosaic";

export type MorphTiming = { holdCross: number; holdB: number; morph: number };

/** Always in motion: a short rest on each shape, then on to the other */
export const defaultTiming: MorphTiming = { holdCross: 3_000, holdB: 3_000, morph: 2_200 };

const CELL_SHARE = 0.6; // of the morph window that each cell spends moving; the rest staggers them outwards
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Drives the emblem between cross and B, writing straight to the SVG: each cell's paths (one per layer, marked
 * `data-cell`) and the colour gradients' endpoints. Pauses off-screen and in hidden tabs; still under reduced motion.
 */
export function useMosaicMorph(root: RefObject<HTMLElement | null>, timing: MorphTiming = defaultTiming) {
    useEffect(() => {
        const element = root.current;
        if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const layers = morphCells.map((_, k) => Array.from(element.querySelectorAll<SVGPathElement>(`[data-cell="${k}"]`)));
        const gradientEls = Array.from(element.querySelectorAll<SVGLinearGradientElement>("linearGradient[data-morph]"));

        const draw = (progress: number) => {
            morphCells.forEach((cell, k) => {
                const local = ease(clamp((progress - cell.stagger * (1 - CELL_SHARE)) / CELL_SHARE));
                const d = rounded(lerpCell(cell, local));
                const opacity = cell.extra ? local.toFixed(3) : "1";
                layers[k].forEach(path => { path.setAttribute("d", d); path.setAttribute("opacity", opacity); });
            });
            const eased = ease(progress);
            const [x1, y1, x2, y2] = gradients.cross.map((value, k) => (value + (gradients.b[k] - value) * eased).toFixed(2));
            gradientEls.forEach(gradient => {
                gradient.setAttribute("x1", x1); gradient.setAttribute("y1", y1);
                gradient.setAttribute("x2", x2); gradient.setAttribute("y2", y2);
            });
        };

        // Phases: hold the cross, morph to B, hold the B, morph back
        const phases = [
            { duration: timing.holdCross },
            { duration: timing.morph, from: 0, to: 1 },
            { duration: timing.holdB },
            { duration: timing.morph, from: 1, to: 0 },
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
            draw(from! + (to! - from!) * t);
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
