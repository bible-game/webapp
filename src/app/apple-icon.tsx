import { ImageResponse } from "next/og";
import { emblemSvg, svgDataUri } from "@/core/style/emblem-svg";

/** The home-screen icon: the B on the ground, outlined in neon with a tight bloom (platforms apply their own mask) */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
    const src = svgDataUri(emblemSvg({ shape: "b", style: "outlined", width: 180, height: 180, scale: 0.64 }));
    // eslint-disable-next-line @next/next/no-img-element
    return new ImageResponse(<img src={src} width={180} height={180} alt=""/>, size);
}
