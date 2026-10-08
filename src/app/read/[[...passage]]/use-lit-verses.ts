"use client"

import { RefObject, useEffect, useState } from "react";

/** The band of the viewport, as fractions of its height, where verses stay fully lit */
const BAND_TOP = 0.12;
const BAND_BOTTOM = 0.72;

/**
 * Tracks which verses sit within the reading band as the page scrolls
 * @since 8th October 2026
 */
export function useLitVerses(containerRef: RefObject<HTMLElement | null>, deps: unknown[]) {
    const [lit, setLit] = useState<Set<string>>(new Set());

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let frame = 0;
        const measure = () => {
            frame = 0;
            const top = window.innerHeight * BAND_TOP;
            const doc = document.documentElement;
            const atEnd = doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 4;
            // At either end of the page, keep everything in view lit
            const bottom = window.scrollY < 40 || atEnd ? window.innerHeight : window.innerHeight * BAND_BOTTOM;

            const next = new Set<string>();
            container.querySelectorAll<HTMLElement>("[data-v]").forEach((verse) => {
                const rects = verse.getClientRects();
                const first = rects[0];
                const last = rects[rects.length - 1];
                if (first && last && last.bottom > top && first.top < bottom) next.add(verse.dataset.v!);
            });
            setLit((current) => (current.size === next.size && [...next].every((v) => current.has(v)) ? current : next));
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return lit;
}
