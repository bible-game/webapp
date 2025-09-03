"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    GraduationCap,
    BookOpen,
    BookMarked,
    History,
    Shuffle,
    Search,
    ArrowRight,
} from "lucide-react";
import Background from "@/app/background";
import Menu from "@/app/menu";

// --- Bible metadata ---------------------------------------------------------
// 66-book Protestant canon with chapter counts
// (If you support deuterocanon elsewhere, extend this list accordingly.)
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

const BOOK_ALIASES: Record<string, string> = {
    // A handful of friendly aliases to help the search parser
    "song of solomon": "Song of Songs",
    "song": "Song of Songs",
    "canticles": "Song of Songs",
    "psalm": "Psalms",
    "1cor": "1 Corinthians",
    "2cor": "2 Corinthians",
    "1thess": "1 Thessalonians",
    "2thess": "2 Thessalonians",
    "1tim": "1 Timothy",
    "2tim": "2 Timothy",
};

function normaliseBook(input: string): string | null {
    const clean = input.trim().replace(/\s+/g, " ").toLowerCase();
    const direct = BOOKS.find((b) => b.name.toLowerCase() === clean)?.name;
    if (direct) return direct;
    const alias = BOOK_ALIASES[clean];
    if (alias) return alias;
    // Try to match ignoring dots and short forms like "1 Jo" → "1 John"
    const canonical = BOOKS.find((b) => {
        const bClean = b.name.toLowerCase().replace(/\./g, "");
        return bClean.startsWith(clean.replace(/\./g, ""));
    })?.name;
    return canonical ?? null;
}

function toPassageSlug(book: string, chapter: number) {
    // Existing dynamic route expects the passage as a string; encode spaces safely.
    return encodeURIComponent(`${book} ${chapter}`);
}

const RECENTS_KEY = "study:recent";

export default function Study(props: any) {
    const [testament, setTestament] = useState<"ALL" | "OT" | "NT">("ALL");
    const [book, setBook] = useState<string>("Genesis");
    const [chapter, setChapter] = useState<number>(1);
    const [query, setQuery] = useState<string>("");
    const [recents, setRecents] = useState<string[]>([]);

    const filteredBooks = useMemo(
        () => BOOKS.filter((b) => (testament === "ALL" ? true : b.testament === testament)),
        [testament]
    );

    useEffect(() => {
        // Ensure chapter range is valid when the book changes
        const max = BOOKS.find((b) => b.name === book)?.chapters ?? 1;
        if (chapter > max) setChapter(1);
    }, [book]);

    useEffect(() => {
        // Load recent studies from localStorage
        if (typeof window === "undefined") return;
        try {
            const raw = localStorage.getItem(RECENTS_KEY);
            if (raw) setRecents(JSON.parse(raw));
        } catch {}
    }, []);

    function pushRecent(passage: string) {
        try {
            const next = [passage, ...recents.filter((p) => p !== passage)].slice(0, 8);
            setRecents(next);
            localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
        } catch {}
    }

    function handleGo(to?: string) {
        const target =
            to ?? `/study/${toPassageSlug(book, chapter)}`;
        pushRecent(decodeURIComponent(target.replace(/^\/study\//, "")));
        window.location.assign(target);
    }

    function handleRandom() {
        const pool = testament === "ALL" ? BOOKS : BOOKS.filter((b) => b.testament === testament);
        const b = pool[Math.floor(Math.random() * pool.length)];
        const ch = Math.floor(Math.random() * b.chapters) + 1;
        handleGo(`/study/${toPassageSlug(b.name, ch)}`);
    }

    function parseQuery() {
        // Accept inputs like "John 3", "1 Jo 4", "psalm 23"
        const m = query.match(/^(.*?)[\s,]+(\d{1,3})\s*$/i);
        if (!m) return;
        const b = normaliseBook(m[1]);
        if (!b) return;
        const ch = Math.max(1, Math.min(parseInt(m[2], 10), BOOKS.find((x) => x.name === b)!.chapters));
        setBook(b);
        setChapter(ch);
    }

    const maxChapters = BOOKS.find((b) => b.name === book)?.chapters ?? 1;
    const slug = toPassageSlug(book, chapter);

    return (
        <>
            <Background />
            <main className="min-h-screen text-[#e8ecff] flex flex-col z-10 relative items-center w-full">
                <Menu isLanding={false} info={props.info} />

                {/* Header */}
                <section className="flex flex-col items-center justify-center text-center py-10 sm:py-20 px-6 w-full">
                    <motion.div
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8 }} >
                        <h1 className="text-4xl font-extrabold m-0 flex items-center gap-3 w-full text-center">
                            <GraduationCap className="opacity-80" size={48} />
                            Study
                        </h1>
                        <p className="mt-3 text-[#adb3d6] max-w-xl">
                            Jump to any chapter and view its four study questions and your summary.
                        </p>
                    </motion.div>
                </section>

                {/* Picker */}
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
                <footer className="mt-auto py-6 border-t border-white/10 text-center text-sm text-[#adb3d6] w-full">
                    © {new Date().getFullYear()} Bible Game
                </footer>
            </main>
        </>
    );
}
