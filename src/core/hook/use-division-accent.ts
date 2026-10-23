"use client"

import { useEffect } from "react";
import { Book, divisionColour } from "@/core/model/bible/books";
import { glow, tone } from "@/core/style/regions";

/**
 * Accents the page in the colour of the book's division, as on Play's map.
 * Set on the root, so sheets rendered outside the page share it: `--division` (the region's light, for text, lines and
 * lit glass), `--division-solid` (its solid tone, for the one solid action) and `--division-glow` (that action's glow).
 * @since 8th October 2026
 */
export function useDivisionAccent(book?: Book) {
    const accent = divisionColour(book);

    useEffect(() => {
        const root = document.documentElement.style;
        const vars = accent ? { "--division": accent, "--division-solid": tone(accent, "solid"), "--division-glow": glow(accent) } : {};
        for (const name of ["--division", "--division-solid", "--division-glow"]) {
            const value = (vars as Record<string, string>)[name];
            if (value) root.setProperty(name, value); else root.removeProperty(name);
        }
        return () => { for (const name of ["--division", "--division-solid", "--division-glow"]) root.removeProperty(name); };
    }, [accent]);
}
