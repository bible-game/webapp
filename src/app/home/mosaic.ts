import { playTheme } from "@/core/style/play-theme";

/**
 * Mosaic geometry for the home emblem: a Latin cross and the stained-glass "B" of the logo, both laid as glass cells
 * in one coordinate space (the cross spans 60 × 96 units), and the pairing that lets one become the other.
 * Every cell has six corners, listed clockwise, and paired cells are turned to line up, so they morph without twisting.
 */

export type Point = [number, number];

export const WIDTH = 60;
export const HEIGHT = 96;
const GAP = 0.75;
export const CORNER = 1.3;

export const divisionStops = [playTheme.teal, playTheme.purple, playTheme.rose, playTheme.green, playTheme.gold];

/** Colour runs teal → gold: down the cross, and from the B's stem (cool) to its bowls (warm), as in the logo */
export const gradients = { cross: [8, 0, 52, HEIGHT], b: [-11, 28, 71, 70] };

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

const glass = (cell: Point[]): Point[] => inset(normalise(cell), GAP);

/** Adds the midpoints of a quad's two longest edges, so it has the six corners of a traced logo cell */
function sixCorners(quad: Point[]): Point[] {
    const length = (k: number) => Math.hypot(quad[(k + 1) % 4][0] - quad[k][0], quad[(k + 1) % 4][1] - quad[k][1]);
    const longest = [0, 1, 2, 3].sort((a, b) => length(b) - length(a)).slice(0, 2);
    return quad.flatMap((p, k) => {
        const q = quad[(k + 1) % 4];
        return longest.includes(k) ? [p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as Point] : [p];
    });
}

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
}, 1).map(glass).map(sixCorners);

/**
 * The logo's B, cell for cell: traced from public/icon-bright.png by finding each glass cell (a dark region enclosed
 * by the glowing outlines), growing it to the middle of its outline, and reducing its hull to six corners. Scaled to
 * the cross's 96-unit height and centred on it, so the B is wider (about -11 to 71). Regenerate if the logo changes.
 */
const tracedB: Point[][] = [
    [[18.69, 0], [27.3, 0], [28.32, 0.73], [27.59, 6.86], [19.57, 6.71], [18.26, 2.77]],
    [[-10.78, 0.29], [0.46, 0.29], [5.12, 8.9], [0.75, 12.69], [-4.07, 13.86], [-10.92, 3.06]],
    [[2.94, 0.29], [16.65, 0.29], [17.82, 6.27], [10.67, 11.96], [5.56, 8.61], [2.5, 1.17]],
    [[29.64, 0], [39.7, 0], [40.43, 2.48], [38.24, 8.02], [35.33, 8.75], [28.03, 6.71]],
    [[37.95, 8.46], [40.72, 0.88], [42.62, 0.15], [53.85, 3.36], [50.5, 12.4], [45.39, 15.61]],
    [[50.5, 11.09], [53.85, 3.5], [59.54, 6.71], [64.36, 12.55], [56.04, 16.63], [50.64, 12.55]],
    [[-3.34, 14.15], [5.42, 7.73], [10.52, 12.11], [6.44, 22.91], [3.81, 23.34], [-3.48, 19.55]],
    [[6, 23.34], [11.4, 11.38], [17.09, 8.75], [17.96, 9.19], [17.96, 22.91], [9.94, 25.53]],
    [[50.5, 12.55], [55.6, 16.78], [55.02, 21.59], [53.56, 24.51], [46.27, 24.66], [44.95, 16.49]],
    [[-4.21, 21.45], [-3.48, 21.01], [5.85, 23.49], [7.6, 26.12], [6, 33.12], [-4.07, 33.7]],
    [[53.56, 24.66], [55.75, 16.78], [64.07, 12.69], [65.96, 15.9], [65.67, 28.45], [56.63, 28.45]],
    [[8.33, 26.84], [16.8, 25.09], [17.82, 25.24], [17.82, 39.54], [10.96, 39.98], [7.6, 33.7]],
    [[46.27, 24.8], [53.42, 24.66], [56.63, 29.33], [54.44, 35.45], [52.1, 39.25], [44.22, 34.87]],
    [[52.4, 38.08], [56.77, 28.74], [61.73, 28.01], [65.67, 28.6], [61.15, 37.06], [53.42, 42.31]],
    [[-3.34, 35.02], [6.29, 34.14], [9.65, 40.71], [5.85, 46.98], [-3.92, 44.35], [-4.21, 36.47]],
    [[20.01, 41.43], [28.76, 41.43], [29.49, 41.73], [29.34, 47.12], [28.32, 48.15], [19.71, 48.15]],
    [[38.97, 39.98], [44.95, 35.16], [52.1, 39.39], [52.69, 41.73], [44.52, 45.37], [40.87, 43.77]],
    [[6.88, 47.85], [10.67, 41.14], [17.82, 41.29], [17.82, 48.88], [11.11, 53.54], [10.09, 53.69]],
    [[29.78, 46.4], [30.95, 41.58], [37.08, 40.41], [42.91, 45.08], [39.7, 50.63], [30.8, 48.29]],
    [[43.06, 45.08], [52.83, 41.87], [58.09, 46.98], [53.42, 56.32], [47.29, 58.36], [39.85, 50.63]],
    [[-4.21, 46.54], [-3.34, 46.25], [5.85, 48.88], [9.36, 55], [4.69, 59.23], [-4.21, 55.88]],
    [[53.42, 56.46], [58.09, 47.71], [65.38, 52.38], [69.32, 58.5], [67.57, 60.98], [59.98, 63.17]],
    [[4.98, 60.4], [10.52, 55.29], [16.8, 50.92], [17.82, 50.77], [17.82, 64.49], [6.58, 65.22]],
    [[47.73, 60.11], [49.91, 57.92], [53.42, 56.61], [59.84, 63.32], [57.5, 69.74], [49.04, 69.16]],
    [[-4.07, 58.21], [-3.34, 57.92], [3.96, 60.98], [5.12, 65.51], [3.08, 70.18], [-4.07, 69.88]],
    [[57.5, 69.88], [59.98, 63.32], [68.88, 60.84], [70.34, 61.86], [71.36, 71.49], [63.05, 74.41]],
    [[6.44, 66.38], [17.82, 66.38], [17.82, 77.76], [16.36, 78.2], [8.63, 77.47], [4.54, 70.91]],
    [[-4.07, 71.78], [3.52, 71.34], [7.17, 77.47], [3.96, 83.31], [1.77, 84.04], [-4.07, 79.95]],
    [[47.14, 76.74], [48.89, 69.3], [57.36, 69.88], [62.75, 74.55], [56.77, 84.47], [47.73, 78.35]],
    [[57.65, 84.18], [62.9, 74.55], [68.74, 71.34], [71.07, 71.64], [68.3, 81.26], [62.61, 87.83]],
    [[4.83, 84.33], [8.63, 78.64], [17.82, 79.81], [17.82, 86.81], [16.5, 87.39], [6.29, 88.71]],
    [[41.89, 84.91], [47, 79.08], [54.88, 83.02], [56.92, 85.06], [51.37, 94.83], [45.83, 94.54]],
    [[-11.36, 92.35], [-4.36, 81.85], [3.08, 84.04], [4.83, 89.58], [-0.13, 95.71], [-10.63, 95.71]],
    [[12.71, 89.29], [17.23, 88.71], [18.55, 89], [21.32, 94.83], [21.03, 95.85], [13, 95.85]],
    [[20.59, 88.71], [29.49, 88.71], [29.78, 90.46], [29.05, 95.85], [22.92, 95.85], [20.44, 89.73]],
    [[30.36, 94.4], [31.24, 88.41], [41.02, 85.93], [45.1, 93.96], [44.81, 95.85], [30.8, 95.85]],
    [[53.71, 91.33], [57.06, 84.47], [60.42, 85.79], [62.9, 88.41], [56.19, 93.23], [53.42, 93.52]],
    [[2.5, 94.83], [6.29, 89.73], [10.96, 89.58], [11.69, 95.56], [11.11, 96], [2.94, 95.85]],
];
export const bCells = tracedB.map(glass);

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

/** Rotates `to`'s corners to sit closest to `from`'s, each about its own centre, so a cell turns as little as it can */
function align(from: Point[], to: Point[]): Point[] {
    const [fx, fy] = centroid(from), [tx, ty] = centroid(to);
    const cost = (r: number) => from.reduce((sum, [x, y], k) => {
        const [ux, uy] = to[(k + r) % to.length];
        return sum + Math.hypot((ux - tx) - (x - fx), (uy - ty) - (y - fy));
    }, 0);
    const best = to.reduce((b, _, r) => cost(r) < cost(b) ? r : b, 0);
    return [...to.slice(best), ...to.slice(0, best)];
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

    // The B is drawn first, so its cells light up outward from its middle
    const centre = centroid(bCells.flatMap(cell => cell));
    const entrance = (cell: Point[]) => { const [x, y] = centroid(cell); return Math.round(Math.hypot(x - centre[0], y - centre[1]) * 14); };
    const stagger = (i: number) => Math.min(1, Math.hypot(from[i][0] - 0.5, from[i][1] - 0.3) / 0.75);
    const seed = (cell: Point[]): Point[] => { const c = centroid(cell); return cell.map(([x, y]) => [c[0] + (x - c[0]) * 0.15, c[1] + (y - c[1]) * 0.15]); };

    const cells: MorphCell[] = match.map((j, i) => ({ cross: crossCells[i], b: align(crossCells[i], bCells[j]), extra: false, entrance: entrance(bCells[j]), stagger: stagger(i) }));
    bCells.forEach((cell, j) => {
        if (taken.has(j)) return;
        const parent = from.reduce((best, _, i) => distance(i, j) < distance(best, j) ? i : best, 0);
        cells.push({ cross: seed(crossCells[parent]), b: align(crossCells[parent], cell), extra: true, entrance: entrance(cell), stagger: Math.min(1, stagger(parent) + 0.15) });
    });
    return cells;
}

export const morphCells = pair();

/** The shape `progress` of the way from cross (0) to B (1) */
export function lerpCell(cell: MorphCell, progress: number): Point[] {
    return cell.cross.map(([x, y], k) => [x + (cell.b[k][0] - x) * progress, y + (cell.b[k][1] - y) * progress]);
}
