"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {Shuffle, ArrowRight,} from "lucide-react";

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
        <section className="w-full max-w-3xl mx-auto px-6 pb-4 sm:pb-10">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-lg">
                {/* Testament filter */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        {(["ALL", "OT", "NT"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTestament(t)}
                                className={`px-3 py-1.5 rounded-xl text-sm border transition ${
                                    testament === t
                                        ? "bg-white/20 border-white/30"
                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                }`}
                            >
                                {t === "ALL" ? "All" : t === "OT" ? "Old Testament" : "New Testament"}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRandom}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm bg-white/10 border border-white/10 hover:bg-white/20 transition">
                            <Shuffle size={16} /> Random
                        </button>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wide text-[#adb3d6]">Book</span>
                        <select
                            value={book}
                            onChange={(e) => setBook(e.target.value)}
                            className="bg-transparent border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-white/30">
                            {filteredBooks.map((b) => (
                                <option key={b.name} value={b.name} className="bg-[#0a0e2a]">
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wide text-[#adb3d6]">Chapter</span>
                        <select
                            value={chapter}
                            onChange={(e) => setChapter(parseInt(e.target.value, 10))}
                            className="bg-transparent border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-white/30">
                            {Array.from({ length: maxChapters }, (_, i) => i + 1).map((c) => (
                                <option key={c} value={c} className="bg-[#0a0e2a]">
                                    {c}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2 justify-end items-end">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleGo()}
                                className="px-4 py-2 rounded-xl bg-white/20 border border-white/20 hover:bg-white/30 transition flex items-center gap-2">
                                Open study <ArrowRight className="inline -mt-1" size={16} />
                            </button>
                        </div>
                    </label>
                </div>
            </motion.div>
        </section>
    );
}

const BOOKS: { name: string; chapters: number; testament: "OT" | "NT" }[] = [
    { name: "Genesis", chapters: 50, testament: "OT" },
    { name: "Exodus", chapters: 40, testament: "OT" },
    { name: "Leviticus", chapters: 27, testament: "OT" },
    { name: "Numbers", chapters: 36, testament: "OT" },
    { name: "Deuteronomy", chapters: 34, testament: "OT" },
    { name: "Joshua", chapters: 24, testament: "OT" },
    { name: "Judges", chapters: 21, testament: "OT" },
    { name: "Ruth", chapters: 4, testament: "OT" },
    { name: "1 Samuel", chapters: 31, testament: "OT" },
    { name: "2 Samuel", chapters: 24, testament: "OT" },
    { name: "1 Kings", chapters: 22, testament: "OT" },
    { name: "2 Kings", chapters: 25, testament: "OT" },
    { name: "1 Chronicles", chapters: 29, testament: "OT" },
    { name: "2 Chronicles", chapters: 36, testament: "OT" },
    { name: "Ezra", chapters: 10, testament: "OT" },
    { name: "Nehemiah", chapters: 13, testament: "OT" },
    { name: "Esther", chapters: 10, testament: "OT" },
    { name: "Job", chapters: 42, testament: "OT" },
    { name: "Psalms", chapters: 150, testament: "OT" },
    { name: "Proverbs", chapters: 31, testament: "OT" },
    { name: "Ecclesiastes", chapters: 12, testament: "OT" },
    { name: "Song of Songs", chapters: 8, testament: "OT" },
    { name: "Isaiah", chapters: 66, testament: "OT" },
    { name: "Jeremiah", chapters: 52, testament: "OT" },
    { name: "Lamentations", chapters: 5, testament: "OT" },
    { name: "Ezekiel", chapters: 48, testament: "OT" },
    { name: "Daniel", chapters: 12, testament: "OT" },
    { name: "Hosea", chapters: 14, testament: "OT" },
    { name: "Joel", chapters: 3, testament: "OT" },
    { name: "Amos", chapters: 9, testament: "OT" },
    { name: "Obadiah", chapters: 1, testament: "OT" },
    { name: "Jonah", chapters: 4, testament: "OT" },
    { name: "Micah", chapters: 7, testament: "OT" },
    { name: "Nahum", chapters: 3, testament: "OT" },
    { name: "Habakkuk", chapters: 3, testament: "OT" },
    { name: "Zephaniah", chapters: 3, testament: "OT" },
    { name: "Haggai", chapters: 2, testament: "OT" },
    { name: "Zechariah", chapters: 14, testament: "OT" },
    { name: "Malachi", chapters: 4, testament: "OT" },
    { name: "Matthew", chapters: 28, testament: "NT" },
    { name: "Mark", chapters: 16, testament: "NT" },
    { name: "Luke", chapters: 24, testament: "NT" },
    { name: "John", chapters: 21, testament: "NT" },
    { name: "Acts", chapters: 28, testament: "NT" },
    { name: "Romans", chapters: 16, testament: "NT" },
    { name: "1 Corinthians", chapters: 16, testament: "NT" },
    { name: "2 Corinthians", chapters: 13, testament: "NT" },
    { name: "Galatians", chapters: 6, testament: "NT" },
    { name: "Ephesians", chapters: 6, testament: "NT" },
    { name: "Philippians", chapters: 4, testament: "NT" },
    { name: "Colossians", chapters: 4, testament: "NT" },
    { name: "1 Thessalonians", chapters: 5, testament: "NT" },
    { name: "2 Thessalonians", chapters: 3, testament: "NT" },
    { name: "1 Timothy", chapters: 6, testament: "NT" },
    { name: "2 Timothy", chapters: 4, testament: "NT" },
    { name: "Titus", chapters: 3, testament: "NT" },
    { name: "Philemon", chapters: 1, testament: "NT" },
    { name: "Hebrews", chapters: 13, testament: "NT" },
    { name: "James", chapters: 5, testament: "NT" },
    { name: "1 Peter", chapters: 5, testament: "NT" },
    { name: "2 Peter", chapters: 3, testament: "NT" },
    { name: "1 John", chapters: 5, testament: "NT" },
    { name: "2 John", chapters: 1, testament: "NT" },
    { name: "3 John", chapters: 1, testament: "NT" },
    { name: "Jude", chapters: 1, testament: "NT" },
    { name: "Revelation", chapters: 22, testament: "NT" },
];
