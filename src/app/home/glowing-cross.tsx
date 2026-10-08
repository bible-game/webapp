import React from "react";
import { playTheme } from "@/core/style/play-theme";

/**
 * A Latin cross laid as a mosaic of glowing cells, like the stained-glass logo.
 * Cells are tinted through the map's divisions in canonical order (Law → Gospels),
 * with a white neon core; the halo behind turns slowly through the same colours.
 */

type Point = [number, number];

export const WIDTH = 60;
export const HEIGHT = 96;
const xs = [0, 11, 22, 30, 38, 49, 60];
const ys = [0, 10, 20, 28, 36, 46, 56, 66, 76, 86, 96];
const STEM = [22, 38];
const BAR = [20, 36];
const GAP = 0.75;
const CORNER = 1.3;
const CENTRE: Point = [30, 28];

export const divisionStops = [playTheme.teal, playTheme.purple, playTheme.rose, playTheme.green, playTheme.gold];

/** Deterministic noise in [-1, 1], so server and client render the same mosaic */
function noise(i: number, j: number, seed: number): number {
    const n = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
}

function inside(i: number, j: number): boolean {
    if (i < 0 || j < 0 || i >= xs.length - 1 || j >= ys.length - 1) return false;
    const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
    return (cx > STEM[0] && cx < STEM[1]) || (cy > BAR[0] && cy < BAR[1]);
}

/** Interior vertices wander freely; edge vertices slide along their edge; corners stay put */
function vertex(i: number, j: number): Point {
    const [x, y] = [xs[i], ys[j]];
    const tl = inside(i - 1, j - 1), tr = inside(i, j - 1), bl = inside(i - 1, j), br = inside(i, j);
    const count = [tl, tr, bl, br].filter(Boolean).length;
    const dx = 2.4 * noise(i, j, 1), dy = 2.4 * noise(i, j, 2);
    if (count === 4) return [x + dx, y + dy];
    if (count === 2 && ((tl && bl) || (tr && br))) return [x, y + dy];
    if (count === 2 && ((tl && tr) || (bl && br))) return [x + dx, y];
    return [x, y];
}

/** Moves each edge of a convex polygon inwards by `distance` */
function inset(points: Point[], distance: number): Point[] {
    const n = points.length;
    const lines = points.map((p, k) => {
        const q = points[(k + 1) % n];
        const [ex, ey] = [q[0] - p[0], q[1] - p[1]];
        const length = Math.hypot(ex, ey);
        const [nx, ny] = [-ey / length, ex / length];
        return { p: [p[0] + nx * distance, p[1] + ny * distance] as Point, d: [ex, ey] as Point };
    });
    return lines.map((a, k) => {
        const b = lines[(k + n - 1) % n];
        const cross = b.d[0] * a.d[1] - b.d[1] * a.d[0];
        const t = ((a.p[0] - b.p[0]) * a.d[1] - (a.p[1] - b.p[1]) * a.d[0]) / cross;
        return [b.p[0] + b.d[0] * t, b.p[1] + b.d[1] * t];
    });
}

/** A closed path with softly rounded corners */
function rounded(points: Point[], radius: number): string {
    const n = points.length;
    const towards = (from: Point, to: Point): Point => {
        const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
        const r = Math.min(radius, length / 2.5) / length;
        return [from[0] + (to[0] - from[0]) * r, from[1] + (to[1] - from[1]) * r];
    };
    const f = (p: Point) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    return points.map((p, k) => {
        const before = towards(p, points[(k + n - 1) % n]), after = towards(p, points[(k + 1) % n]);
        return `${k === 0 ? "M" : "L"}${f(before)} Q${f(p)} ${f(after)}`;
    }).join(" ") + " Z";
}

// Clockwise in screen space, so the inset moves inwards
export const cells = xs.slice(0, -1).flatMap((_, i) => ys.slice(0, -1).map((_, j) => [i, j])).filter(([i, j]) => inside(i, j)).map(([i, j]) => {
    const corners: Point[] = [vertex(i, j), vertex(i + 1, j), vertex(i + 1, j + 1), vertex(i, j + 1)];
    const cx = corners.reduce((sum, p) => sum + p[0], 0) / 4, cy = corners.reduce((sum, p) => sum + p[1], 0) / 4;
    return { key: `${i}-${j}`, d: rounded(inset(corners, GAP), CORNER), delay: Math.round(Math.hypot(cx - CENTRE[0], cy - CENTRE[1]) * 14) };
});

function Cells({ id, className }: { id: string; className?: string }) {
    return <g className={className}>
        {cells.map(cell => <path key={cell.key} d={cell.d} style={{ animationDelay: `${cell.delay}ms` }}
                                 fill={`url(#${id}-fill)`} stroke={`url(#${id}-line)`} strokeWidth={1.15} strokeLinejoin="round"/>)}
    </g>;
}

export default function GlowingCross({ height = 120 }: { height?: number }) {
    const id = "glowing-cross";
    const width = height * WIDTH / HEIGHT;
    const stops = divisionStops.map((colour, k) => <stop key={colour + k} offset={k / (divisionStops.length - 1)} stopColor={colour}/>);

    return <div aria-hidden="true" className="glowing-cross" style={{ width, height }}>
        <div className="glowing-cross-spectrum"/>
        <div className="glowing-cross-core"/>
        <svg viewBox={`-6 -6 ${WIDTH + 12} ${HEIGHT + 12}`} className="glowing-cross-art">
            <defs>
                <linearGradient id={`${id}-line`} gradientUnits="userSpaceOnUse" x1={8} y1={0} x2={52} y2={HEIGHT}>{stops}</linearGradient>
                <linearGradient id={`${id}-fill`} gradientUnits="userSpaceOnUse" x1={8} y1={0} x2={52} y2={HEIGHT}>
                    {divisionStops.map((colour, k) => <stop key={colour + k} offset={k / (divisionStops.length - 1)} stopColor={colour} stopOpacity={0.22}/>)}
                </linearGradient>
                <filter id={`${id}-bloom`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={1.3} result="neon"/>
                    <feGaussianBlur in="SourceGraphic" stdDeviation={4.5} result="bloom"/>
                    <feMerge><feMergeNode in="bloom"/><feMergeNode in="bloom"/><feMergeNode in="neon"/></feMerge>
                </filter>
            </defs>
            <g filter={`url(#${id}-bloom)`} className="glowing-cross-bloom"><Cells id={id}/></g>
            <Cells id={id} className="glowing-cross-cells"/>
            <g className="glowing-cross-filament">
                {cells.map(cell => <path key={cell.key} d={cell.d} fill="none" stroke="#fff" strokeWidth={0.4} strokeLinejoin="round"
                                         style={{ animationDelay: `${cell.delay}ms` }}/>)}
            </g>
        </svg>
    </div>;
}
