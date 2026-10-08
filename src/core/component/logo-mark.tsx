import React, { useId } from "react";
import { bCells, divisionStops, gradients, rounded } from "@/core/style/mosaic";

/**
 * The stained-glass "B", drawn from the same traced cells as the home page's emblem: crisp at any size and free of the
 * PNG's dark square. Still; for the moving emblem see `app/home/glowing-cross.tsx`.
 */
export default function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
    const id = useId().replace(/:/g, "");
    const [x1, y1, x2, y2] = gradients.b;
    const stops = (opacity: number) => divisionStops.map((colour, k) =>
        <stop key={colour + k} offset={k / (divisionStops.length - 1)} stopColor={colour} stopOpacity={opacity}/>);

    return <svg viewBox="-15 -4 90 104" width={size * 90 / 104} height={size} aria-hidden="true" className={className}
                style={{ overflow: "visible", filter: "drop-shadow(0 0 3px rgba(255, 255, 255, 0.18))" }}>
        <defs>
            <linearGradient id={`${id}-line`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>{stops(1)}</linearGradient>
            <linearGradient id={`${id}-fill`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>{stops(0.22)}</linearGradient>
        </defs>
        {bCells.map((cell, k) => <path key={k} d={rounded(cell)} fill={`url(#${id}-fill)`} stroke={`url(#${id}-line)`}
                                       strokeWidth={2.2} strokeLinejoin="round"/>)}
    </svg>;
}
