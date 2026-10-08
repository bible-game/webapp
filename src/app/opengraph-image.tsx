import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { cells, divisionStops, HEIGHT, WIDTH } from "@/app/home/glowing-cross";
import { uiTheme } from "@/core/style/ui-theme";

export const alt = "Bible Game: a glowing mosaic cross in the colours of the Bible's divisions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The home page's cross, drawn as one SVG: halo blobs in the division colours, a bloom, then the cells */
function crossSvg(): string {
    const stops = divisionStops.map((colour, k) => `<stop offset="${k / (divisionStops.length - 1)}" stop-color="${colour}"/>`).join("");
    const fills = divisionStops.map((colour, k) => `<stop offset="${k / (divisionStops.length - 1)}" stop-color="${colour}" stop-opacity="0.22"/>`).join("");
    const paths = (extra: string) => cells.map(cell => `<path d="${cell.d}" ${extra}/>`).join("");
    const halo = divisionStops.map((colour, k) => {
        const angle = (k / divisionStops.length) * Math.PI * 2 - Math.PI / 2;
        return `<circle cx="${30 + Math.cos(angle) * 30}" cy="${40 + Math.sin(angle) * 30}" r="30" fill="${colour}" opacity="0.5"/>`;
    }).join("");

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -50 180 196" width="360" height="392">
        <defs>
            <linearGradient id="line" gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="52" y2="${HEIGHT}">${stops}</linearGradient>
            <linearGradient id="fill" gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="52" y2="${HEIGHT}">${fills}</linearGradient>
            <filter id="halo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="18"/></filter>
            <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="neon"/>
                <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="wide"/>
                <feMerge><feMergeNode in="wide"/><feMergeNode in="wide"/><feMergeNode in="neon"/></feMerge>
            </filter>
        </defs>
        <g filter="url(#halo)">${halo}<circle cx="${WIDTH / 2}" cy="28" r="22" fill="#fffcf5" opacity="0.18"/></g>
        <g filter="url(#bloom)">${paths(`fill="url(#fill)" stroke="url(#line)" stroke-width="1.15"`)}</g>
        ${paths(`fill="url(#fill)" stroke="url(#line)" stroke-width="1.15" stroke-linejoin="round"`)}
        ${paths(`fill="none" stroke="#fff" stroke-width="0.4" stroke-linejoin="round" opacity="0.3"`)}
    </svg>`;
}

export default async function OpenGraphImage() {
    const [regular, semibold] = await Promise.all([
        readFile(join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff")),
        readFile(join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-600-normal.woff")),
    ]);
    const src = `data:image/svg+xml;base64,${Buffer.from(crossSvg()).toString("base64")}`;

    return new ImageResponse(
        <div style={{ display: "flex", width: "100%", height: "100%", fontFamily: "Inter", alignItems: "center", justifyContent: "center", gap: 48, background: uiTheme.bg }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} width={360} height={392} alt=""/>
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 520 }}>
                <div style={{ fontSize: 76, fontWeight: 600, color: uiTheme.text }}>Bible Game</div>
                <div style={{ marginTop: 16, fontSize: 34, lineHeight: 1.35, color: uiTheme.muted }}>Explore the Bible with a daily passage guessing game</div>
            </div>
        </div>,
        { ...size, fonts: [{ name: "Inter", data: regular, weight: 400 }, { name: "Inter", data: semibold, weight: 600 }] },
    );
}
