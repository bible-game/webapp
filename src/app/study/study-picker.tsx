"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {Shuffle, ArrowRight,} from "lucide-react";
import { BOOKS } from "@/core/model/bible/books";

export default function StudyPicker(props: any) {
    const [testament, setTestament] = useState<"ALL" | "OT" | "NT">("ALL");
    const [book, setBook] = useState<string>("Genesis");
    const [chapter, setChapter] = useState<number>(1);

    const maxChapters = BOOKS.find((b) => b.name === book)?.chapters ?? 1;
    const filteredBooks = useMemo(
        () => BOOKS.filter((b) => (testament === "ALL" ? true : b.testament === testament)),
        [testament]
    );

    useEffect(() => {
        // Ensure chapter range is valid when the book changes
        const max = BOOKS.find((b) => b.name === book)?.chapters ?? 1;
        if (chapter > max) setChapter(1);
    }, [book]);

    function handleGo(to?: string) {
        const target =
            to ?? `/study/${toPassageSlug(book, chapter)}`;
        window.location.assign(target);
    }

    function handleRandom() {
        const pool = testament === "ALL" ? BOOKS : BOOKS.filter((b) => b.testament === testament);
        const b = pool[Math.floor(Math.random() * pool.length)];
        const ch = Math.floor(Math.random() * b.chapters) + 1;

        setBook(b.name);
        setChapter(ch);
    }

    function toPassageSlug(book: string, chapter: number) {
        return encodeURIComponent(`${book.replace(/ /g, "")}${chapter}`);
    }

    return (
        <section className="w-full pb-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="w-full">
                {/* Testament filter */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div role="group" aria-label="Testament" className="flex flex-wrap items-center gap-1 rounded-lg bg-ui-surface p-1">
                        {(["ALL", "OT", "NT"] as const).map((t) => (
                            <button
                                key={t}
                                aria-pressed={testament === t}
                                onClick={() => {
                                    setTestament(t);
                                    if (t !== "ALL" && BOOKS.find(b => b.name === book)?.testament !== t) {
                                        setBook(BOOKS.find(b => b.testament === t)!.name);
                                        setChapter(1);
                                    }
                                }}
                                className={`min-h-10 px-3 py-2 rounded-md text-sm transition ${
                                    testament === t
                                        ? "bg-ui-raised text-ui-text"
                                        : "text-ui-muted hover:text-ui-text"
                                }`}
                            >
                                {t === "ALL" ? "All" : t === "OT" ? "Old Testament" : "New Testament"}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRandom}
                            className="ui-button">
                            <Shuffle size={16} /> Random
                        </button>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm text-ui-muted">Book</span>
                        <select
                            aria-label="Book"
                            value={book}
                            onChange={(e) => setBook(e.target.value)}
                            className="ui-field">
                            {filteredBooks.map((b) => (
                                <option key={b.name} value={b.name} className="bg-ui-surface">
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm text-ui-muted">Chapter</span>
                        <select
                            aria-label="Chapter"
                            value={chapter}
                            onChange={(e) => setChapter(parseInt(e.target.value, 10))}
                            className="ui-field">
                            {Array.from({ length: maxChapters }, (_, i) => i + 1).map((c) => (
                                <option key={c} value={c} className="bg-ui-surface">
                                    {c}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2 justify-end items-end">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleGo()}
                                className="ui-button ui-primary">
                                Open study <ArrowRight className="inline -mt-1" size={16} />
                            </button>
                        </div>
                    </label>
                </div>
            </motion.div>
        </section>
    );
}
