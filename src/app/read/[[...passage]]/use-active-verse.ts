"use client"

import { RefObject, useEffect, useState } from "react";

/** Fraction of the viewport height where the reader's eye rests */
const READING_LINE = 0.4;

/**
 * Tracks which verse sits on the reading line as the page scrolls
 * @since 8th October 2026
 */
export function useActiveVerse(containerRef: RefObject<HTMLElement | null>, deps: unknown[]) {
    const [active, setActive] = useState<string | undefined>();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let frame = 0;
        const measure = () => {
            frame = 0;
            const verses = Array.from(container.querySelectorAll<HTMLElement>("[data-v]"));
            if (!verses.length) return;

            const doc = document.documentElement;
            if (doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 4) {
                setActive(verses[verses.length - 1].dataset.v);
                return;
            }

            // The line starts on the first verse, then settles at its resting height as you scroll
            const firstTop = verses[0].getClientRects()[0]?.top ?? 0;
            const line = Math.max(firstTop + 2, window.innerHeight * READING_LINE * Math.min(1, window.scrollY / 200));
            let current = verses[0];
            for (const verse of verses) {
                if (verse.getClientRects()[0]?.top > line) break;
                current = verse;
            }
            setActive(current.dataset.v);
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

    return active;
}
