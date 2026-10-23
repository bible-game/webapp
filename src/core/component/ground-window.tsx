"use client";

import React, { useEffect, useRef } from "react";
import Ground from "@/core/component/ground";

/**
 * A window onto the ground, for solid chrome (Read's and Study's header and footer): a copy of the page's ground, cut to
 * the bar that holds it (`clip-path`, see %chrome in globals.sass) and kept in step with the original, so content
 * scrolling beneath is hidden while the bar still reads as the open ground, with no band at its edge.
 * @since 23rd October 2026
 */
export default function GroundWindow() {
    const root = useRef<HTMLDivElement>(null);

    // the copy's drift starts when it mounts; set it to the original's place in each cycle
    useEffect(() => {
        const original = document.querySelector(".ground:not(.ground-copy)");
        const copy = root.current?.querySelector(".ground");
        if (!original || !copy) return;
        const spans = [Array.from(original.children), Array.from(copy.children)];
        spans[1].forEach((span, k) => {
            const [from, to] = [spans[0][k]?.getAnimations()[0], span.getAnimations()[0]];
            if (from && to) to.currentTime = from.currentTime;
        });
    }, []);

    return <div ref={root} className="contents"><Ground copy/></div>;
}
