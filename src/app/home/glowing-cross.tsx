"use client";

import React, { useRef } from "react";
import { HEIGHT, morphCells, rounded, WIDTH } from "@/core/style/mosaic";
import { MorphTiming, useMosaicMorph } from "@/app/home/use-mosaic-morph";

/**
 * The Hero B into Cross emblem, as the original logo (public/icon-bright.png): outlined glass stones with white-hot
 * lines, a tight coloured glow and dark tinted glass inside, each stone in its own colour from the logo's cool and warm
 * runs (stoneColours in mosaic.ts). Between the shapes the stones drift as stars, each to the stone of its own colour (use-mosaic-morph.ts).
 * Renders the B on the server; the morph runs after.
 */

type Layer = "bloom" | "stone" | "core";

/** One layer of cells; each cell is wrapped so its entrance (CSS) and its shape (the morph) never contend */
function Cells({ layer }: { layer: Layer }) {
    return <g>
        {morphCells.map((cell, k) => {
            const paint = layer === "core"
                ? { fill: "none", stroke: "#ffffff", strokeWidth: 0.42, strokeOpacity: 0.75 }
                : { "data-colour": "", fill: cell.colour.b, fillOpacity: 0.14, stroke: cell.colour.b, strokeWidth: layer === "bloom" ? 1.6 : 1.15 };
            return <g key={k} className="glowing-cross-cell" style={{ animationDelay: `${cell.entrance}ms` }}>
                <path data-cell={k} d={rounded(cell.b)} strokeLinejoin="round" {...paint}/>
            </g>;
        })}
    </g>;
}

export default function GlowingCross({ height = 160, timing }: { height?: number; timing?: MorphTiming }) {
    const id = "glowing-cross";
    const root = useRef<HTMLDivElement>(null);
    useMosaicMorph(root, timing);

    const width = height * WIDTH / HEIGHT;
    return <div ref={root} aria-hidden="true" className="glowing-cross" style={{ width, height }}>
        <svg viewBox={`-6 -6 ${WIDTH + 12} ${HEIGHT + 12}`} className="glowing-cross-art">
            <defs>
                <filter id={`${id}-bloom`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={1.2} result="neon"/>
                    <feGaussianBlur in="SourceGraphic" stdDeviation={3.5} result="wide"/>
                    <feMerge><feMergeNode in="wide"/><feMergeNode in="neon"/></feMerge>
                </filter>
            </defs>
            {/* the glow rests at 70% and swells to full while the stones travel (data-bloom, set by the morph) */}
            <g data-bloom="" opacity={0.7}>
                <g filter={`url(#${id}-bloom)`} className="glowing-cross-bloom"><Cells layer="bloom"/></g>
            </g>
            <Cells layer="stone"/>
            <g className="glowing-cross-filament"><Cells layer="core"/></g>
        </svg>
    </div>;
}
