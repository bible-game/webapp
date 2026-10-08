"use client"

import React, { useEffect, useRef } from "react";
import ReaderSheet from "@/app/read/[[...passage]]/reader-sheet";
import { ReaderSettings } from "@/app/read/[[...passage]]/use-reader-settings";
import { READING_FONTS, ReadingFont } from "@/core/style/reading-fonts";
import translations from "./translations.json";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    settings: ReaderSettings;
    update: (patch: Partial<ReaderSettings>) => void;
};

const label = "mb-2 block text-[12px] font-medium text-[var(--reader-muted)]";

/**
 * Text settings: translation, typeface, size, spacing, and focus
 * @since 8th October 2026
 */
export default function TypeSheet({ open, onOpenChange, settings, update }: Props) {
    const translation = translations[settings.translation as keyof typeof translations];
    const chipsRef = useRef<HTMLDivElement>(null);

    // Bring the chosen translation into view, as the row scrolls sideways on phones
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => {
            const row = chipsRef.current;
            const chip = row?.querySelector<HTMLElement>('[aria-checked="true"]');
            if (row && chip) row.scrollLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
        }, 50);
        return () => clearTimeout(t);
    }, [open]);

    return (
        <ReaderSheet open={open} onOpenChange={onOpenChange} title="Text">
            <section>
                <span className={label}>Translation</span>
                <div ref={chipsRef} role="radiogroup" aria-label="Translation" className="relative -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
                    {Object.entries(translations).map(([key, t]) => (
                        <button key={key} type="button" role="radio" aria-checked={settings.translation === key}
                                aria-label={t.name} title={t.name}
                                onClick={() => update({ translation: key })}
                                className="reader-chip shrink-0 uppercase">
                            {t.abbr}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-[13px] text-[var(--reader-muted)]">{translation?.name}</p>
            </section>

            <section>
                <span className={label}>Typeface</span>
                <div role="radiogroup" aria-label="Typeface" className="grid grid-cols-4 gap-2">
                    {(Object.entries(READING_FONTS) as [ReadingFont, typeof READING_FONTS[ReadingFont]][]).map(([key, font]) => (
                        <button key={key} type="button" role="radio" aria-checked={settings.font === key}
                                onClick={() => update({ font: key })}
                                className="reader-tile">
                            <span aria-hidden className="text-[26px] leading-none" style={{ fontFamily: font.family }}>Aa</span>
                            <span className="text-[11px]">{font.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="grid gap-5">
                <label className="flex items-center gap-3">
                    <span aria-hidden className="w-5 text-center text-[13px]">A</span>
                    <input type="range" aria-label="Text size" min={16} max={24} step={1} value={settings.size}
                           onChange={(e) => update({ size: parseInt(e.target.value, 10) })}
                           className="reader-range" style={{ "--fill": `${((settings.size - 16) / 8) * 100}%` } as React.CSSProperties}/>
                    <span aria-hidden className="w-5 text-center text-[20px]">A</span>
                </label>
                <label className="flex items-center gap-3">
                    <svg aria-hidden viewBox="0 0 20 20" className="size-5 text-[var(--reader-muted)]"><path d="M4 7h12M4 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <input type="range" aria-label="Line spacing" min={1.45} max={1.9} step={0.05} value={settings.leading}
                           onChange={(e) => update({ leading: parseFloat(e.target.value) })}
                           className="reader-range" style={{ "--fill": `${((settings.leading - 1.45) / 0.45) * 100}%` } as React.CSSProperties}/>
                    <svg aria-hidden viewBox="0 0 20 20" className="size-5 text-[var(--reader-muted)]"><path d="M4 4h12M4 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </label>
            </section>

            <button type="button" role="switch" aria-checked={settings.focus}
                    onClick={() => update({ focus: !settings.focus })}
                    className="flex min-h-12 items-center justify-between gap-4 text-left">
                <span>
                    <span className="block text-[15px]">Focus</span>
                    <span className="block text-[13px] text-[var(--reader-muted)]">Dim the verses around the one you&apos;re reading</span>
                </span>
                <span aria-hidden className="reader-switch" />
            </button>
        </ReaderSheet>
    );
}
