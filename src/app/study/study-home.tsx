"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SearchIcon, Shuffle, StarIcon } from "lucide-react";
import { Star } from "@/app/play/[game]/star";
import { BOOKS, Book, divisionColour } from "@/core/model/bible/books";
import { ReviewState } from "@/core/model/state/review-state";
import { StateUtil } from "@/core/util/state-util";
import { parseReviewDate, parseStudyKey, studyKey } from "@/app/study/study-util";

type Testament = "ALL" | "OT" | "NT";

const MAX_STARS = 5;
const RECENT = 5;

const normalise = (s: string) => s.replace(/\s/g, "").toLowerCase();

/** A row of earned stars, in Play's gold */
function Stars({ stars, size = "!size-4" }: { stars: number; size?: string }) {
    return (
        <span className="flex items-center" aria-label={`${stars} of ${MAX_STARS} stars`} role="img">
            {Array.from({ length: MAX_STARS }, (_, i) => i < stars
                ? <Star key={i} filled shadow={false} className={`${size} !text-play-accent`} />
                : <StarIcon key={i} aria-hidden className={`${size.replace(/!/g, "")} text-ui-faint`} strokeWidth={1.5} />)}
        </span>
    );
}

/**
 * Study home: your recent studies, and choosing a passage to study
 * @since 8th October 2026
 */
export default function StudyHome(props: { state?: Map<string, ReviewState> }) {
    const router = useRouter();
    const [reviews, setReviews] = useState<ReviewState[]>([]);
    const [testament, setTestament] = useState<Testament>("ALL");
    const [query, setQuery] = useState("");
    const [book, setBook] = useState<Book | undefined>();

    useEffect(() => {
        if (props.state) StateUtil.setAllReviews(props.state as any);
        try {
            setReviews(Array.from(StateUtil.getAllReviews().values()).filter((r) => r.answers?.length));
        } catch { /* no saved studies */ }
    }, [props.state]);

    const recent = useMemo(() => [...reviews]
        .sort((a, b) => (parseReviewDate(b.date)?.getTime() ?? 0) - (parseReviewDate(a.date)?.getTime() ?? 0))
        .slice(0, RECENT), [reviews]);

    // stars earned, by book and chapter
    const starsByChapter = useMemo(() => {
        const map = new Map<string, number>();
        reviews.forEach((r) => {
            const { book: b, chapter } = parseStudyKey(r.passageKey);
            if (b) map.set(normalise(`${b.name}${chapter}`), r.stars ?? 0);
        });
        return map;
    }, [reviews]);

    const books = useMemo(() => BOOKS
        .filter((b) => testament === "ALL" || b.testament === testament)
        .filter((b) => !query.trim() || normalise(b.name).includes(normalise(query))), [testament, query]);

    function random() {
        const pool = books.length ? books : BOOKS;
        const b = pool[Math.floor(Math.random() * pool.length)];
        router.push(`/study/${studyKey(b.name, Math.floor(Math.random() * b.chapters) + 1)}`);
    }

    return (
        <div className="study pb-16">
            <header className="page-heading">
                <h1>Study</h1>
                <p>Answer four questions and summarise a chapter to earn stars.</p>
            </header>

            {recent.length ? (
                <section aria-labelledby="your-studies" className="mb-10">
                    <h2 id="your-studies" className="mb-2 text-[13px] font-medium text-ui-muted">Your studies</h2>
                    <ul className="divide-y divide-ui-line border-y border-ui-line">
                        {recent.map((r) => {
                            const { book: b, chapter } = parseStudyKey(r.passageKey);
                            const date = parseReviewDate(r.date);
                            const name = b ? `${b.name} ${chapter}` : r.passageKey;
                            return (
                                <li key={r.passageKey}>
                                    <Link href={`/study/${r.passageKey}`}
                                          className="flex min-h-14 items-center gap-3 px-1 hover:bg-white/5">
                                        <span aria-hidden className="size-2 shrink-0 rounded-full"
                                              style={{ background: divisionColour(b) ?? "var(--ui-muted)" }} />
                                        <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{name}</span>
                                        <Stars stars={r.stars ?? 0} />
                                        {date ? (
                                            <span className="w-12 text-right text-[12px] tabular-nums text-ui-muted">
                                                {date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                                            </span>
                                        ) : null}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ) : null}

            <section aria-labelledby="choose">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 id="choose" className="text-[13px] font-medium text-ui-muted">Choose a passage</h2>
                    <button type="button" onClick={random} className="ui-button min-h-10 px-3">
                        <Shuffle className="size-4" />Random
                    </button>
                </div>

                {book ? (
                    <div style={{ "--chip": divisionColour(book) } as React.CSSProperties}>
                        <button type="button" onClick={() => setBook(undefined)}
                                className="-ml-2 mb-2 flex min-h-11 items-center gap-2 rounded-lg px-2 text-[14px] text-ui-muted hover:text-ui-text">
                            <ArrowLeftIcon className="size-4" />All books
                        </button>
                        <h3 className="mb-3 font-clue text-[24px] font-medium" style={{ color: "var(--chip)" }}>{book.name}</h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-1">
                            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
                                const stars = starsByChapter.get(normalise(`${book.name}${c}`));
                                return (
                                    <Link key={c} href={`/study/${studyKey(book.name, c)}`}
                                          aria-label={`${book.name} ${c}${stars !== undefined ? `, ${stars} of ${MAX_STARS} stars` : ""}`}
                                          className="study-chapter" data-studied={stars !== undefined || undefined}>
                                        {c}
                                        {stars !== undefined ? (
                                            <span aria-hidden className="flex items-center gap-px text-[9px] leading-none">
                                                <Star filled shadow={false} className="!size-2.5 !text-play-accent" />{stars}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div role="group" aria-label="Testament" className="flex items-center gap-1 rounded-lg bg-ui-surface p-1">
                                {(["ALL", "OT", "NT"] as const).map((t) => (
                                    <button key={t} type="button" aria-pressed={testament === t} onClick={() => setTestament(t)}
                                            aria-label={t === "ALL" ? "All books" : t === "OT" ? "Old Testament" : "New Testament"}
                                            className={`min-h-10 flex-1 whitespace-nowrap rounded-md px-3 text-sm transition sm:flex-none ${testament === t ? "bg-ui-raised text-ui-text" : "text-ui-muted hover:text-ui-text"}`}>
                                        {t === "ALL" ? "All" : t === "OT" ? "Old" : "New"}
                                        <span className="hidden sm:inline">{t === "ALL" ? "" : " Testament"}</span>
                                    </button>
                                ))}
                            </div>
                            <label className="reader-field flex flex-1 items-center gap-2">
                                <SearchIcon aria-hidden className="size-4 shrink-0 text-ui-muted" />
                                <input type="search" aria-label="Search books" placeholder="Search books"
                                       value={query} onChange={(e) => setQuery(e.target.value)}
                                       className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ui-muted" />
                            </label>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {books.map((b) => (
                                <button key={b.name} type="button" onClick={() => setBook(b)}
                                        className="book-chip" style={{ "--chip": divisionColour(b) } as React.CSSProperties}>
                                    {b.name}
                                </button>
                            ))}
                        </div>
                        {books.length === 0 ? (
                            <p className="py-6 text-[14px] text-ui-muted">No books match “{query}”.</p>
                        ) : null}
                    </>
                )}
            </section>
        </div>
    );
}
