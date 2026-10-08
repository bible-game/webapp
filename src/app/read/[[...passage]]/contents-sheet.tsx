"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SearchIcon } from "lucide-react";
import ReaderSheet from "@/app/read/[[...passage]]/reader-sheet";
import { Book, BOOKS } from "@/core/model/bible/books";
import { StateUtil } from "@/core/util/state-util";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    book?: Book;
    chapter: number;
    readingTime?: string;
    onGo: (passage: string) => void;
};

const normalise = (s: string) => s.replace(/\s/g, "").toLowerCase();

/**
 * Contents: go to a passage, or pick a book and chapter
 * @since 8th October 2026
 */
export default function ContentsSheet({ open, onOpenChange, book, chapter, readingTime, onGo }: Props) {
    const [expanded, setExpanded] = useState<string | undefined>(book?.name);
    const [query, setQuery] = useState("");
    const currentRef = useRef<HTMLDivElement>(null);

    const reads = useMemo(() => {
        if (!open) return new Set<string>();
        try {
            return new Set(Array.from(StateUtil.getAllReads().values()).map((r) => normalise(`${r.book}${r.chapter}`)));
        } catch {
            return new Set<string>();
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        setExpanded(book?.name);
        setQuery("");
        const t = setTimeout(() => currentRef.current?.scrollIntoView({ block: "start" }), 50);
        return () => clearTimeout(t);
    }, [open, book?.name]);

    const go = (passage: string) => {
        onGo(passage);
        onOpenChange(false);
    };

    return (
        <ReaderSheet open={open} onOpenChange={onOpenChange} className="h-[85dvh]"
                     title={book ? `${book.name} ${chapter}` : "Contents"}
                     subtitle={readingTime ? `${readingTime} read` : undefined}>
            <form role="search" className="sticky top-0 z-10 -mx-5 -mt-2 bg-[#161514] px-5 pb-2 pt-2" onSubmit={(e) => { e.preventDefault(); if (query.trim()) go(query.trim()); }}>
                <label className="reader-field flex items-center gap-2">
                    <SearchIcon aria-hidden className="size-4 shrink-0 text-[var(--reader-muted)]" />
                    <input aria-label="Go to passage" placeholder="Go to passage, e.g. John 3:16" enterKeyHint="go"
                           value={query} onChange={(e) => setQuery(e.target.value)}
                           className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--reader-muted)]" />
                </label>
            </form>

            {(["OT", "NT"] as const).map((testament) => (
                <section key={testament} aria-label={testament === "OT" ? "Old Testament" : "New Testament"}>
                    <h3 className="mb-1 text-[12px] font-medium text-[var(--reader-muted)]">
                        {testament === "OT" ? "Old Testament" : "New Testament"}
                    </h3>
                    {BOOKS.filter((b) => b.testament === testament).map((b) => {
                        const isOpen = expanded === b.name;
                        const isCurrent = book?.name === b.name;
                        return (
                            <div key={b.name} ref={isCurrent ? currentRef : undefined} className="scroll-mt-16">
                                <button type="button" aria-expanded={isOpen}
                                        onClick={() => setExpanded(isOpen ? undefined : b.name)}
                                        className={`flex min-h-11 w-full items-center justify-between gap-3 text-left text-[15px] ${isCurrent ? "text-[var(--reader-accent)]" : ""}`}>
                                    {b.name}
                                    <span className="flex items-center gap-2 text-[12px] tabular-nums text-[var(--reader-muted)]">
                                        {b.chapters}
                                        <ChevronDown aria-hidden className={`size-4 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} />
                                    </span>
                                </button>
                                {isOpen ? (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1 pb-3 pt-1">
                                        {Array.from({ length: b.chapters }, (_, i) => i + 1).map((c) => {
                                            const current = isCurrent && c === chapter;
                                            const read = reads.has(normalise(`${b.name}${c}`));
                                            return (
                                                <button key={c} type="button"
                                                        aria-label={`${b.name} ${c}${read ? ", read" : ""}`}
                                                        aria-current={current ? "page" : undefined}
                                                        onClick={() => go(`${b.name} ${c}`)}
                                                        className="reader-chapter" data-read={read || undefined}>
                                                    {c}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </section>
            ))}
        </ReaderSheet>
    );
}
