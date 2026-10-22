"use client"

import { useCallback, useEffect, useState } from "react";
import { READING_FONTS, ReadingFont } from "@/core/style/reading-fonts";

export type ReaderSettings = {
    font: ReadingFont;
    size: number;
    leading: number;
    translation: string;
};

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
    font: "sans",
    size: 19,
    leading: 1.65,
    translation: "web",
};

const STORAGE_KEY = "reader";

/** Per-viewer reading preferences, remembered in this browser */
export function useReaderSettings() {
    const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
            // a face that has since been retired (Literata, "inter") falls back to the default
            if (saved && !(saved.font in READING_FONTS)) delete saved.font;
            if (saved) setSettings({ ...DEFAULT_READER_SETTINGS, ...saved });
        } catch { /* storage unavailable: keep defaults */ }
    }, []);

    const update = useCallback((patch: Partial<ReaderSettings>) => {
        setSettings((current) => {
            const next = { ...current, ...patch };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch { /* storage unavailable: setting lasts for this visit */ }
            return next;
        });
    }, []);

    return [settings, update] as const;
}
