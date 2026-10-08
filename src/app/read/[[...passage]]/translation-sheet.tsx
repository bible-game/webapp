"use client"

import React, { useEffect, useMemo, useState } from "react";
import { CheckIcon, SearchIcon } from "lucide-react";
import ReaderSheet from "@/app/read/[[...passage]]/reader-sheet";
import translations from "./translations.json";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selected: string;
    onSelect: (translation: string) => void;
};

/**
 * Translation: a searchable list of the available translations
 * @since 8th October 2026
 */
export default function TranslationSheet({ open, onOpenChange, selected, onSelect }: Props) {
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (open) setQuery("");
    }, [open]);

    const options = useMemo(() => {
        const q = query.trim().toLowerCase();
        return Object.entries(translations).filter(([, t]) =>
            !q || t.name.toLowerCase().includes(q) || t.abbr.toLowerCase().includes(q) || t.language.toLowerCase().includes(q));
    }, [query]);

    return (
        <ReaderSheet open={open} onOpenChange={onOpenChange} title="Translation" className="max-h-[85dvh]">
            <label className="reader-field sticky top-0 z-10 flex items-center gap-2 bg-ui-surface">
                <SearchIcon aria-hidden className="size-4 shrink-0 text-[var(--reader-muted)]" />
                <input aria-label="Search translations" placeholder="Search translations" type="search"
                       value={query} onChange={(e) => setQuery(e.target.value)}
                       className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--reader-muted)]" />
            </label>

            <div role="radiogroup" aria-label="Translation" className="-mx-2 -mt-3 grid">
                {options.map(([key, t]) => {
                    const checked = key === selected;
                    return (
                        <button key={key} type="button" role="radio" aria-checked={checked}
                                onClick={() => { onSelect(key); onOpenChange(false); }}
                                className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-2 text-left hover:bg-white/5">
                            <span className="min-w-0">
                                <span className={`block text-[15px] ${checked ? "text-[var(--reader-accent)]" : ""}`}>{t.name}</span>
                                <span className="block text-[12px] uppercase text-[var(--reader-muted)]">{t.abbr}</span>
                            </span>
                            {checked ? <CheckIcon aria-hidden className="size-5 shrink-0 text-[var(--reader-accent)]" /> : null}
                        </button>
                    );
                })}
                {options.length === 0 ? (
                    <p className="px-2 py-3 text-[14px] text-[var(--reader-muted)]">No translations match “{query}”.</p>
                ) : null}
            </div>
        </ReaderSheet>
    );
}
