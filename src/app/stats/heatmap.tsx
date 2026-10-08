"use client"

import React, { useState, useMemo } from 'react';
import { CompletionUtil } from "@/core/util/completion-util";

interface Props {
    data: any;
    bible: any;
}

const completionColor = (pct: number) => {
    if (pct === 0) return "bg-ui-surface";
    if (pct < 1) return "bg-ui-accent";
    return "bg-ui-won";
};

const completionOpacity = (pct: number) => {
    if (pct === 0) return "opacity-60";
    if (pct < 0.25) return "opacity-50";
    if (pct < 0.5) return "opacity-65";
    if (pct < 0.75) return "opacity-80";
    return "opacity-90";
};

const verseColor = (verse: any) => {
    if (verse === '') return "bg-ui-surface";
    if (verse === 0) return "bg-ui-accent opacity-85";
    return "bg-ui-won opacity-85";
};

const Heatmap = (props: Readonly<Props>) => {
    const [expandedBook, setExpandedBook] = useState<string | null>(null);
    const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

    const groups = useMemo(() => {
        if (!props.bible?.testaments) return [];
        return props.bible.testaments.flatMap((testament: any) =>
            testament.divisions.map((division: any) => ({
                name: division.name,
                testament: testament.name,
                books: division.books.map((book: any) => {
                    const key = book.name.toLowerCase().replace(/ /g, "");
                    const bookData = props.data[key];
                    return {
                        key,
                        name: book.name,
                        completion: bookData ? CompletionUtil.calcBookCompletion(bookData) : 0,
                        data: bookData,
                    };
                }),
            }))
        );
    }, [props.bible, props.data]);

    const hasAnyCompletion = useMemo(() => {
        return groups.some((g: any) => g.books.some((b: any) => b.completion > 0));
    }, [groups]);

    const toggleBook = (bookKey: string) => {
        if (expandedBook === bookKey) {
            setExpandedBook(null);
            setExpandedChapter(null);
        } else {
            setExpandedBook(bookKey);
            setExpandedChapter(null);
        }
    };

    const toggleChapter = (chapterIdx: number) => {
        setExpandedChapter(expandedChapter === chapterIdx ? null : chapterIdx);
    };

    const expandedBookData = expandedBook ? props.data[expandedBook] : null;

    return (
        <section className="w-full border-t border-ui-line pt-6">
            <div className="w-full">
                <h3 className="text-[16px] font-semibold mb-4">Bible Completion</h3>

                {!hasAnyCompletion && (
                    <div className="text-center py-6 mb-4 rounded-md bg-white/[0.02] border border-dashed border-ui-line">
                        <p className="text-sm text-ui-faint font-light">No progress yet</p>
                        <p className="text-xs text-ui-faint font-light mt-1">Play games and read passages to track your completion here</p>
                    </div>
                )}

                <div className="space-y-5">
                    {groups.map((group: any) => (
                        <div key={group.name}>
                            <h4 className="text-[13px] font-medium text-ui-muted mb-2">
                                {group.name}
                            </h4>
                            <div className="space-y-0.5">
                                {group.books.map((book: any) => {
                                    const isExpanded = expandedBook === book.key;
                                    const pct = book.completion;

                                    return (
                                        <div key={book.key}>
                                            <button
                                                aria-expanded={isExpanded}
                                                onClick={() => toggleBook(book.key)}
                                                className={`w-full min-h-11 flex items-center gap-3 px-2 py-2 rounded-md text-left transition-all duration-200 border ${
                                                    isExpanded
                                                        ? 'border-white/20 bg-ui-surface'
                                                        : 'border-transparent hover:border-ui-line hover:bg-white/[0.02]'
                                                }`}
                                            >
                                                <span className="text-xs font-light text-ui-text w-28 sm:w-36 flex-shrink-0 truncate">
                                                    {book.name}
                                                </span>
                                                <div className="flex-1 h-1.5 rounded-full bg-white/[0.15] overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${pct === 0 ? '' : pct < 1 ? 'bg-ui-accent' : 'bg-ui-won'}`}
                                                        style={{ width: `${Math.max(pct * 100, pct > 0 ? 2 : 0)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-ui-muted tabular-nums w-8 text-right flex-shrink-0">
                                                    {Math.round(pct * 100)}%
                                                </span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className={`w-3 h-3 text-ui-faint flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </button>

                                            {isExpanded && expandedBookData && (
                                                <div className="ml-6 mt-1 mb-2 pl-3 border-l border-ui-line">
                                                    <div className="flex flex-wrap gap-1 py-2">
                                                        {expandedBookData.chapters.map((chapter: any, idx: number) => {
                                                            const chapterPct = CompletionUtil.calcChapterCompletion(chapter);
                                                            const isChapterExpanded = expandedChapter === idx;
                                                            return (
                                                                <div key={idx} className={isChapterExpanded ? 'w-full' : ''}>
                                                                    <button
                                                                        aria-expanded={isChapterExpanded}
                                                                        aria-label={`Chapter ${idx + 1}, ${Math.round(chapterPct * 100)}% seen`}
                                                                        onClick={() => toggleChapter(idx)}
                                                                        className={`rounded flex items-center justify-center text-[10px] font-light transition-all duration-200 border ${
                                                                            isChapterExpanded
                                                                                ? 'w-full px-3 py-1.5 justify-start gap-2 border-white/20 bg-ui-surface mb-1'
                                                                                : `w-11 h-11 border-ui-line hover:border-white/25 hover:scale-105 ${completionColor(chapterPct)} ${completionOpacity(chapterPct)}`
                                                                        }`}
                                                                    >
                                                                        <span className={chapterPct > 0 && !isChapterExpanded ? "text-ui-bg" : "text-ui-text"}>{idx + 1}</span>
                                                                        {isChapterExpanded && (
                                                                            <span className="text-ui-muted text-[9px]">
                                                                                &mdash; {chapter.verses.length} verses &middot; {Math.round(chapterPct * 100)}%
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                    {isChapterExpanded && (
                                                                        <div className="flex flex-wrap gap-0.5 pb-2 pl-1">
                                                                            {chapter.verses.map((verse: any, vIdx: number) => (
                                                                                <div
                                                                                    key={vIdx}
                                                                                    title={`Verse ${vIdx + 1}`}
                                                                                    className={`w-5 h-5 rounded-sm flex items-center justify-center text-[8px] font-light border border-white/5 ${verseColor(verse)}`}
                                                                                >
                                                                                    <span className={verse === '' ? "text-ui-muted" : "text-ui-bg"}>{vIdx + 1}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Heatmap;
