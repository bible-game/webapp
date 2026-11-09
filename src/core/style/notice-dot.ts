import type React from "react";

/**
 * The notice dot's gap: rather than a ring painted round the dot (which can't match a glass button, or one whose fill
 * changes on hover), the icon under it is cut away in a circle, so whatever is behind the button shows through.
 * (`x`, `y`) is the dot's centre in the icon's own box, in px; the gap is the dot's radius plus `gap`
 */
export function noticeGap(x: number, y: number, radius = 5, gap = 2): React.CSSProperties {
    const mask = `radial-gradient(circle ${radius + gap}px at ${x}px ${y}px, transparent 98%, #000 100%)`;
    return { WebkitMaskImage: mask, maskImage: mask };
}
