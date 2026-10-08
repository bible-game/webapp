import { playTheme } from "@/core/style/play-theme";

/**
 * Mosaic geometry for the home emblem: a Latin cross and the stained-glass "B" of the logo, both laid as glass cells
 * in one coordinate space (the cross spans 60 × 96 units), and the pairing that lets one become the other.
 * Every cell is a quad, listed clockwise from its top-left corner, so paired cells interpolate without twisting.
 */

export type Point = [number, number];
type Quad = [Point, Point, Point, Point];

export const WIDTH = 60;
export const HEIGHT = 96;
const GAP = 0.75;
export const CORNER = 1.3;

export const divisionStops = [playTheme.teal, playTheme.purple, playTheme.rose, playTheme.green, playTheme.gold];

/** Colour runs teal → gold: down the cross, and from the B's stem (cool) to its bowls (warm), as in the logo */
export const gradients = { cross: [8, 0, 52, HEIGHT], b: [-6, 28, 64, 70] };

/** Deterministic noise in [-1, 1], so server and client render the same mosaic */
function noise(i: number, j: number, seed: number): number {
    const n = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
}

/** Moves each edge of a convex, clockwise polygon inwards by `distance` */
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
export function rounded(points: Point[], radius = CORNER): string {
    const n = points.length;
    const towards = (from: Point, to: Point): Point => {
        const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
        const r = Math.min(radius, length / 2.5) / length;
        return [from[0] + (to[0] - from[0]) * r, from[1] + (to[1] - from[1]) * r];
    };
    const f = (p: Point) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    return points.map((p, k) => {
        const before = towards(p, points[(k + n - 1) % n]), after = towards(p, points[(k + 1) % n]);
        return `${k === 0 ? "M" : "L"}${f(before)} Q${f(p)} ${f(after)}`;
    }).join(" ") + " Z";
}

export const centroid = (points: Point[]): Point =>
    [points.reduce((sum, p) => sum + p[0], 0) / points.length, points.reduce((sum, p) => sum + p[1], 0) / points.length];

/** Clockwise in screen space, starting from the top-left-most corner */
function normalise(quad: Point[]): Point[] {
    const area = quad.reduce((sum, p, k) => { const q = quad[(k + 1) % quad.length]; return sum + p[0] * q[1] - q[0] * p[1]; }, 0);
    const ordered = area < 0 ? [...quad].reverse() : quad;
    const start = ordered.reduce((best, p, k) => p[0] + p[1] < ordered[best][0] + ordered[best][1] ? k : best, 0);
    return [...ordered.slice(start), ...ordered.slice(0, start)];
}

const glass = (quad: Point[]): Point[] => inset(normalise(quad), GAP);

/**
 * Quads on a jittered lattice: interior vertices wander freely, edge vertices slide along their edge, corners stay put
 */
function lattice(xs: number[], ys: number[], inside: (i: number, j: number) => boolean, seed: number): Point[][] {
    const within = (i: number, j: number) => i >= 0 && j >= 0 && i < xs.length - 1 && j < ys.length - 1 && inside(i, j);
    const vertex = (i: number, j: number): Point => {
        const [x, y] = [xs[i], ys[j]];
        const tl = within(i - 1, j - 1), tr = within(i, j - 1), bl = within(i - 1, j), br = within(i, j);
        const count = [tl, tr, bl, br].filter(Boolean).length;
        const dx = 2.4 * noise(i, j, seed), dy = 2.4 * noise(i, j, seed + 1);
        if (count === 4) return [x + dx, y + dy];
        if (count === 2 && ((tl && bl) || (tr && br))) return [x, y + dy];
        if (count === 2 && ((tl && tr) || (bl && br))) return [x + dx, y];
        return [x, y];
    };
    return xs.slice(0, -1).flatMap((_, i) => ys.slice(0, -1).map((_, j) => [i, j]))
        .filter(([i, j]) => within(i, j))
        .map(([i, j]) => [vertex(i, j), vertex(i + 1, j), vertex(i + 1, j + 1), vertex(i, j + 1)]);
}

// The cross: a 16-unit stem and a crossbar a third of the way down
const crossXs = [0, 11, 22, 30, 38, 49, 60];
const crossYs = [0, 10, 20, 28, 36, 46, 56, 66, 76, 86, 96];
export const crossCells = lattice(crossXs, crossYs, (i, j) => {
    const cx = (crossXs[i] + crossXs[i + 1]) / 2, cy = (crossYs[j] + crossYs[j + 1]) / 2;
    return (cx > 22 && cx < 38) || (cy > 20 && cy < 36);
}, 1).map(glass);

/** Chords of a half-ellipse ring, from the top (-90°) round the right to the bottom (90°) */
type Ellipse = { cx: number; cy: number; rx: number; ry: number };
const at = ({ cx, cy, rx, ry }: Ellipse, degrees: number): Point =>
    [cx + rx * Math.cos(degrees * Math.PI / 180), cy + ry * Math.sin(degrees * Math.PI / 180)];
function ring(outer: Ellipse, inner: Ellipse, segments: number, wobble: number): Quad[] {
    const angle = (k: number) => -90 + 180 * k / segments + (k > 0 && k < segments ? wobble * noise(k, segments, 7) : 0);
    return Array.from({ length: segments }, (_, k) => [at(outer, angle(k)), at(outer, angle(k + 1)), at(inner, angle(k + 1)), at(inner, angle(k))]);
}

// The B: a stem and two bowls, the lower one larger, joined at a waist (proportions after icon-bright.png)
const upperOuter: Ellipse = { cx: 30, cy: 24, rx: 26, ry: 24 };
const upperInner: Ellipse = { cx: 30, cy: 24.5, rx: 12, ry: 13.5 };
const lowerOuter: Ellipse = { cx: 30, cy: 72, rx: 32, ry: 24 };
const lowerInner: Ellipse = { cx: 30, cy: 71.5, rx: 17, ry: 14.5 };

const stemXs = [0, 11, 22];
const stemYs = [0, 12, 24, 36, 48, 60, 72, 84, 96];
export const bCells = [
    ...lattice(stemXs, stemYs, () => true, 11),
    [[22, 0], [30, 0], [30, 11], [22, 11]],
    [[22, 38], [30, 38], [30, 48], [22, 48]],
    [[22, 48], [30, 48], [30, 57], [22, 57]],
    [[22, 86], [30, 86], [30, 96], [22, 96]],
    ...ring(upperOuter, upperInner, 5, 5),
    ...ring(lowerOuter, lowerInner, 7, 5),
].map(cell => glass(cell as Point[]));

/**
 * Pairs each cross cell with a B cell, nearest first in each shape's own unit box, then untangles crossing journeys.
 * The B has more cells than the cross; each extra one divides out of the cross cell nearest to it.
 */
function unit(cells: Point[][]): Point[] {
    const centres = cells.map(centroid);
    const [minX, maxX] = [Math.min(...centres.map(p => p[0])), Math.max(...centres.map(p => p[0]))];
    const [minY, maxY] = [Math.min(...centres.map(p => p[1])), Math.max(...centres.map(p => p[1]))];
    return centres.map(([x, y]) => [(x - minX) / (maxX - minX), (y - minY) / (maxY - minY)]);
}

export type MorphCell = { cross: Point[]; b: Point[]; extra: boolean; entrance: number; stagger: number };

function pair(): MorphCell[] {
    const from = unit(crossCells), to = unit(bCells);
    const distance = (i: number, j: number) => Math.hypot(from[i][0] - to[j][0], from[i][1] - to[j][1]);

    const candidates = from.flatMap((_, i) => to.map((_, j) => [i, j, distance(i, j)])).sort((a, b) => a[2] - b[2]);
    const match = new Array<number>(from.length).fill(-1), taken = new Set<number>();
    for (const [i, j] of candidates) {
        if (match[i] < 0 && !taken.has(j)) { match[i] = j; taken.add(j); }
    }
    for (let improved = true; improved;) {
        improved = false;
        for (let a = 0; a < match.length; a++) for (let b = a + 1; b < match.length; b++) {
            if (distance(a, match[b]) + distance(b, match[a]) < distance(a, match[a]) + distance(b, match[b]) - 1e-9) {
                [match[a], match[b]] = [match[b], match[a]];
                improved = true;
            }
        }
    }

    const centre = centroid(crossCells.flatMap(cell => cell));
    const entrance = (cell: Point[]) => { const [x, y] = centroid(cell); return Math.round(Math.hypot(x - centre[0], y - 28) * 14); };
    const stagger = (i: number) => Math.min(1, Math.hypot(from[i][0] - 0.5, from[i][1] - 0.3) / 0.75);
    const seed = (cell: Point[]): Point[] => { const c = centroid(cell); return cell.map(([x, y]) => [c[0] + (x - c[0]) * 0.15, c[1] + (y - c[1]) * 0.15]); };

    const cells: MorphCell[] = match.map((j, i) => ({ cross: crossCells[i], b: bCells[j], extra: false, entrance: entrance(crossCells[i]), stagger: stagger(i) }));
    bCells.forEach((cell, j) => {
        if (taken.has(j)) return;
        const parent = from.reduce((best, _, i) => distance(i, j) < distance(best, j) ? i : best, 0);
        cells.push({ cross: seed(crossCells[parent]), b: cell, extra: true, entrance: entrance(crossCells[parent]), stagger: Math.min(1, stagger(parent) + 0.15) });
    });
    return cells;
}

export const morphCells = pair();

/** The shape `progress` of the way from cross (0) to B (1) */
export function lerpCell(cell: MorphCell, progress: number): Point[] {
    return cell.cross.map(([x, y], k) => [x + (cell.b[k][0] - x) * progress, y + (cell.b[k][1] - y) * progress]);
}
