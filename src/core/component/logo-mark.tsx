import React from "react";
import { bCells, rounded, stoneColours } from "@/core/style/mosaic";

const COLOURS = stoneColours("b");

/**
 * The stained-glass "B", as the original logo: the same traced stones as the home page's emblem, outlined in the cool
 * run (periwinkle to cyan) up the stem and the warm run (red-orange to yellow) round the bowls, with dark tinted
 * glass inside. Crisp at any size. Still; for the moving emblem see `app/home/glowing-cross.tsx`.
 */
export default function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
    return <svg viewBox="-15 -4 90 104" width={size * 90 / 104} height={size} aria-hidden="true" className={className}
                style={{ overflow: "visible" }}>
        {bCells.map((cell, k) => <path key={k} d={rounded(cell)} fill={COLOURS[k]} fillOpacity={0.2}
                                       stroke={COLOURS[k]} strokeWidth={2.2} strokeLinejoin="round"/>)}
    </svg>;
}
