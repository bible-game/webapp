"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import ReaderSheet from "@/app/read/[[...passage]]/reader-sheet";
import { Book } from "@/core/model/bible/books";
import { StateUtil } from "@/core/util/state-util";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    book?: Book;
    chapter: number;
    onGo: (passage: string) => void;
};

const normalise = (s: string) => s.replace(/\s/g, "").toLowerCase();

/**
 * Passage: go to any reference, or another chapter of this book
 * @since 8th October 2026
 */
export default function PassageSheet({ open, onOpenChange, title, book, chapter, onGo }: Props) {
    const [query, setQuery] = useState("");
    const currentRef = useRef<HTMLButtonElement>(null);

    // Clear the search, and bring the current chapter into view (Psalms runs long)
    useEffect(() => {
        if (!open) return;
        setQuery("");
        const t = setTimeout(() => currentRef.current?.scrollIntoView({ block: "center" }), 50);
        return () => clearTimeout(t);
    }, [open]);

    // chapters of this book read in this browser
    const reads = useMemo(() => {
        if (!open || !book) return new Set<string>();
        try {
            return new Set(Array.from(StateUtil.getAllReads().values()).map((r) => normalise(`${r.book}${r.chapter}`)));
        } catch {
            return new Set<string>();
        }
    }, [open, book]);

    const go = (passage: string) => {
        onGo(passage);
        onOpenChange(false);
    };

    return (
        <ReaderSheet open={open} onOpenChange={onOpenChange} title={title} className="max-h-[85dvh]">
            <form role="search" className="sticky top-0 z-10 -mx-5 -mt-2 bg-ui-surface px-5 pb-2 pt-2" onSubmit={(e) => { e.preventDefault(); if (query.trim()) go(query.trim()); }}>
                <label className="reader-field flex items-center gap-2">
                    <SearchIcon aria-hidden className="size-4 shrink-0 text-[var(--reader-muted)]" />
                    <input aria-label="Go to passage" placeholder="Go to passage, e.g. John 3:16" enterKeyHint="go"
                           autoComplete="off" autoCorrect="off" spellCheck={false}
                           value={query} onChange={(e) => setQuery(e.target.value)}
                           className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--reader-muted)]" />
                </label>
            </form>

            {book && book.chapters > 1 ? (
                <section aria-label={`Chapters of ${book.name}`}>
                    <h3 className="mb-2 text-[12px] font-medium text-[var(--reader-muted)]">{book.name}</h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1">
                        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
                            const current = c === chapter;
                            const read = reads.has(normalise(`${book.name}${c}`));
                            return (
                                <button key={c} type="button" ref={current ? currentRef : undefined}
                                        aria-label={`${book.name} ${c}${read ? ", read" : ""}`}
                                        aria-current={current ? "page" : undefined}
                                        onClick={() => go(`${book.name} ${c}`)}
                                        className="reader-chapter" data-read={read || undefined}>
                                    {c}
                                </button>
                            );
                        })}
                    </div>
                </section>
            ) : null}
        </ReaderSheet>
    );
}
