import { bCells, crossCells, HEIGHT, rounded, stoneColours, WIDTH } from "@/core/style/mosaic";

/**
 * The emblem as a standalone SVG string, for generated images (the favicon, app icons and the social card): the same
 * stones in the original logo's colours (stoneColours in mosaic.ts), on the 1.2 ground.
 * - 'outlined': coloured lines, dark tinted glass inside, white-hot cores and a tight bloom (as on the home page)
 * - 'solid': each stone filled solid, no bloom or core, so the B still reads at 16px
 * @since 23rd October 2026
 */
type Shape = "b" | "cross";
type Style = "outlined" | "solid";

const SHAPES = {
    b: { cells: bCells, colours: stoneColours("b"), box: [-15, -4, 90, 104] },
    cross: { cells: crossCells, colours: stoneColours("cross"), box: [-6, -6, WIDTH + 12, HEIGHT + 12] },
};

/** The stones alone, in the shape's own units */
export function stones(shape: Shape, style: Style): string {
    const { cells, colours } = SHAPES[shape];
    const paths = (paint: (colour: string) => string) =>
        cells.map((cell, k) => `<path d="${rounded(cell)}" stroke-linejoin="round" ${paint(colours[k])}/>`).join("");
    if (style === "solid") return paths(f => `fill="${f}" stroke="${f}" stroke-width="1.15"`);
    const lit = paths(f => `fill="${f}" fill-opacity="0.14" stroke="${f}" stroke-width="1.15"`);
    const core = cells.map(cell => `<path d="${rounded(cell)}" stroke-linejoin="round" fill="none" stroke="#fff" stroke-opacity="0.75" stroke-width="0.42"/>`).join("");
    return `<g filter="url(#bloom)" opacity="0.7">${paths(f => `fill="${f}" fill-opacity="0.14" stroke="${f}" stroke-width="1.6"`)}</g>${lit}${core}`;
}

/** The ground: near-black under broad, diffuse navy, indigo and purple fields (a still frame of the moving one) */
function ground(w: number, h: number): { defs: string; body: string } {
    const fields: [string, number, number, number, number, number][] = [
        ["11,29,68", 0.55, 0.12, 0.10, 0.95, 0.50],
        ["26,20,80", 0.50, 0.98, 0.48, 0.90, 0.45],
        ["43,15,69", 0.45, 0.08, 0.88, 1.00, 0.45],
        ["10,32,72", 0.35, 0.88, 1.02, 0.80, 0.35],
    ];
    const defs = fields.map(([rgb, a], k) => `<radialGradient id="f${k}"><stop offset="0" stop-color="rgb(${rgb})" stop-opacity="${a}"/>` +
        `<stop offset="0.55" stop-color="rgb(${rgb})" stop-opacity="${a * 0.45}"/><stop offset="1" stop-color="rgb(${rgb})" stop-opacity="0"/></radialGradient>`).join("");
    const shapes = fields.map(([, , cx, cy, rx, ry], k) => `<ellipse cx="${cx * w}" cy="${cy * h}" rx="${rx * w}" ry="${ry * h}" fill="url(#f${k})"/>`).join("");
    return { defs, body: `<rect width="${w}" height="${h}" fill="#05060a"/>${shapes}` };
}

/**
 * The emblem on the ground, `width` × `height`, with the shape `scale` of the height tall and its centre at (`cx`, `cy`)
 * (fractions of the image). Returns an SVG document.
 */
export function emblemSvg({ shape, style, width, height, scale = 0.62, cx = 0.5, cy = 0.5, withGround = true }:
    { shape: Shape; style: Style; width: number; height: number; scale?: number; cx?: number; cy?: number; withGround?: boolean }): string {
    const [bx, by, bw, bh] = SHAPES[shape].box;
    const k = (height * scale) / bh;
    const tx = width * cx - (bx + bw / 2) * k, ty = height * cy - (by + bh / 2) * k;
    const g = ground(width, height);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        `<defs>${withGround ? g.defs : ""}<filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">` +
        `<feGaussianBlur in="SourceGraphic" stdDeviation="1" result="neon"/><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="wide"/>` +
        `<feMerge><feMergeNode in="wide"/><feMergeNode in="neon"/></feMerge></filter></defs>` +
        `${withGround ? g.body : ""}<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})">${stones(shape, style)}</g></svg>`;
}

/** An SVG document as a data URI, for an <img> in an ImageResponse */
export const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
