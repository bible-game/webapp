import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { emblemSvg, svgDataUri } from "@/core/style/emblem-svg";
import { uiTheme } from "@/core/style/ui-theme";

export const alt = "Bible Game: a mosaic cross in the colours of the Bible's regions, on a night-dark ground";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
    const [regular, semibold] = await Promise.all([
        readFile(join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff")),
        readFile(join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff")),
    ]);
    // the 1.2 ground with the cross on it, left of centre; the text sits to its right
    const src = svgDataUri(emblemSvg({ shape: "cross", style: "outlined", width: 1200, height: 630, scale: 0.62, cx: 0.27 }));
    return new ImageResponse(
        <div style={{ display: "flex", width: "100%", height: "100%", fontFamily: "IBM Plex Sans", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} width={1200} height={630} alt="" style={{ position: "absolute", top: 0, left: 0 }}/>
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 560, marginLeft: 560 }}>
                <div style={{ fontSize: 76, fontWeight: 600, color: uiTheme.text }}>Bible Game</div>
                <div style={{ marginTop: 16, fontSize: 34, lineHeight: 1.35, color: uiTheme.muted }}>Explore the Bible with a daily passage-guessing game</div>
            </div>
        </div>,
        { ...size, fonts: [{ name: "IBM Plex Sans", data: regular, weight: 400 }, { name: "IBM Plex Sans", data: semibold, weight: 600 }] },
    );
}
