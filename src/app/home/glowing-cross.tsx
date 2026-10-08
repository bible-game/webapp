"use client";

import React, { useRef } from "react";
import { divisionStops, gradients, HEIGHT, morphCells, rounded, WIDTH } from "@/app/home/mosaic";
import { MorphTiming, useMosaicMorph } from "@/app/home/use-mosaic-morph";

/**
 * A Latin cross laid as a mosaic of glowing cells, like the stained-glass logo, which now and then becomes that logo's
 * "B" and returns. Cells are tinted through the map's divisions in canonical order (Law → Gospels) with a white neon
 * core; the halo behind turns slowly through the same colours. Renders the cross on the server; the morph runs after.
 */

/** One layer of cells; each cell is wrapped so its entrance (CSS) and shape (the morph) never contend */
function Cells({ className, ...paint }: { className?: string } & React.SVGProps<SVGPathElement>) {
    return <g className={className}>
        {morphCells.map((cell, k) => <g key={k} className="glowing-cross-cell" style={{ animationDelay: `${cell.entrance}ms` }}>
            <path data-cell={k} d={rounded(cell.cross)} opacity={cell.extra ? 0 : 1} strokeLinejoin="round" {...paint}/>
        </g>)}
    </g>;
}

export default function GlowingCross({ height = 120, timing }: { height?: number; timing?: MorphTiming }) {
    const id = "glowing-cross";
    const root = useRef<HTMLDivElement>(null);
    useMosaicMorph(root, timing);

    const width = height * WIDTH / HEIGHT;
    const [x1, y1, x2, y2] = gradients.cross;
    const stops = (opacity: number) => divisionStops.map((colour, k) =>
        <stop key={colour + k} offset={k / (divisionStops.length - 1)} stopColor={colour} stopOpacity={opacity}/>);

    return <div ref={root} aria-hidden="true" className="glowing-cross" style={{ width, height }}>
        <div className="glowing-cross-spectrum"/>
        <div className="glowing-cross-core"/>
        <svg viewBox={`-6 -6 ${WIDTH + 12} ${HEIGHT + 12}`} className="glowing-cross-art">
            <defs>
                <linearGradient id={`${id}-line`} data-morph="" gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>{stops(1)}</linearGradient>
                <linearGradient id={`${id}-fill`} data-morph="" gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>{stops(0.22)}</linearGradient>
                <filter id={`${id}-bloom`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={1.3} result="neon"/>
                    <feGaussianBlur in="SourceGraphic" stdDeviation={4.5} result="bloom"/>
                    <feMerge><feMergeNode in="bloom"/><feMergeNode in="bloom"/><feMergeNode in="neon"/></feMerge>
                </filter>
            </defs>
            <g filter={`url(#${id}-bloom)`} className="glowing-cross-bloom">
                <Cells fill={`url(#${id}-fill)`} stroke={`url(#${id}-line)`} strokeWidth={1.15}/>
            </g>
            <Cells fill={`url(#${id}-fill)`} stroke={`url(#${id}-line)`} strokeWidth={1.15}/>
            <Cells className="glowing-cross-filament" fill="none" stroke="#fff" strokeWidth={0.4}/>
        </svg>
    </div>;
}
