import { ImageResponse } from "next/og";
import { emblemSvg, svgDataUri } from "@/core/style/emblem-svg";

/** The favicon: the B on the ground, each stone filled solid so it still reads at 16-32px */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
    const src = svgDataUri(emblemSvg({ shape: "b", style: "solid", width: 32, height: 32, scale: 0.78 }));
    // eslint-disable-next-line @next/next/no-img-element
    return new ImageResponse(<img src={src} width={32} height={32} alt=""/>, size);
}
