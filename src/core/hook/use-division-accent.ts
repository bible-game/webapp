"use client"

import { useEffect } from "react";
import { Book, divisionColour } from "@/core/model/bible/books";

/**
 * Accents the page in the colour of the book's division, as on Play's map.
 * Set on the root as `--division`, so sheets rendered outside the page share it.
 * @since 8th October 2026
 */
export function useDivisionAccent(book?: Book) {
    const accent = divisionColour(book);

    useEffect(() => {
        const root = document.documentElement.style;
        if (accent) root.setProperty("--division", accent);
        else root.removeProperty("--division");
        return () => { root.removeProperty("--division"); };
    }, [accent]);
}
