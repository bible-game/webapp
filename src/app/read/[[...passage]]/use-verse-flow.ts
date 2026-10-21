"use client"

import { RefObject, useEffect } from "react";

/**
 * Sets each verse to carry on from where the one before it ended, a line lower: the verse is its own block, so it sits
 * below its neighbour, and its first line is indented to the point the previous verse's last line reached. The effect
 * is a half line-break - the text steps down without going back to the margin - and it needs measuring, since where a
 * verse ends is known only once it is laid out.
 *
 * Each verse is a block, so its own indent cannot move the verses above it; measuring and setting them in order is a
 * single pass, with no settling.
 * @since 21st October 2026
 */
export function useVerseFlow(containerRef: RefObject<HTMLElement | null>, deps: unknown[]) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let frame = 0;
        const measure = () => {
            frame = 0;
            const verses = Array.from(container.querySelectorAll<HTMLElement>("[data-v]"));
            verses.forEach((verse) => {
                verse.style.textIndent = "";
                delete verse.dataset.flush;
            });

            const { left, width } = container.getBoundingClientRect();
            const style = getComputedStyle(container);
            // --reader-gap is set in body ems, so that the step across keeps its proportions at any reading size, and
            // --reader-reach as a share of the column: past it there is too little room left to carry on into
            const gap = parseFloat(style.fontSize) * (parseFloat(style.getPropertyValue("--reader-gap")) || 0);
            const reach = parseFloat(style.getPropertyValue("--reader-reach")) || 0.6;

            // the verse is a block, whose own rect is the full width of the column: its last line is found by measuring
            // a range over its contents, which gives a rect per line
            const range = document.createRange();

            verses.forEach((verse, i) => {
                if (i === 0) return;
                range.selectNodeContents(verses[i - 1]);
                const rects = range.getClientRects();
                const last = rects[rects.length - 1];
                if (!last) return;

                const indent = last.right - left + gap;
                if (indent > width * reach) {
                    // too little of the line left to carry on into: this verse starts at the margin, and has to take a
                    // whole line to do it, since half a line down is where the verse before it still has its last line
                    verse.dataset.flush = "";
                } else {
                    verse.style.textIndent = `${indent}px`;
                }
            });
        };

        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };

        schedule();
        const observer = new ResizeObserver(schedule);
        observer.observe(container);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
