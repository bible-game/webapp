"use client";

import Link from "next/link";
import { Github, Mail, Play } from "lucide-react";
import { useState } from "react";

export default function About() {
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText("hello@bible.game");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy email", err);
        }
    };

    return (
        <main className="min-h-screen text-[#e8ecff] sm:mx-[5%] md:mx-[15%]">
            {/* Outer container for header + explanation + vision */}
            <div className="w-full mx-auto px-6 md:px-12 py-12">
                {/* Header */}
                <header className="flex items-center gap-4 mb-8 justify-between">
                    <div className="sm:flex gap-4">
                        <div className="w-12 h-12 rounded-xl border border-white/15 bg-gradient-to-b from-[#1a1f3f] to-[#0f1430] shadow-lg grid place-items-center overflow-hidden">
                            <img src="/icon-nobg.png" alt="Bible Game icon" className="w-8 h-8" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-extrabold text-xl tracking-wide">Bible Game</div>
                            <div className="text-sm text-[#adb3d6]">
                                A daily Bible passage guessing game
                            </div>
                        </div>
                    </div>
                    <div className="sm:flex items-center gap-3">
                        <Link
                            href="/play/today"
                            className="my-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <Play size={16} /> Play
                        </Link>
                        <a
                            href="https://github.com/bible-game"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="my-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <Github size={16} /> GitHub
                        </a>
                        <button
                            onClick={handleCopyEmail}
                            className="my-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2 relative"
                        >
                            <Mail size={16} />
                            hello@bible.game
                            {copied && (
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-green-300">
                  Copied!
                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Explanation */}
                <section className="w-full mb-10">
                    <h2 className="text-lg font-bold tracking-wide mb-3">Explanation</h2>
                    <div className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-7">
                        <h3 className="inline-block pb-1 relative font-bold text-lg md:text-xl">
                            See the Bible Like Never Before
                            <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-gradient-conic from-sky-400 via-green-300 via-yellow-300 via-red-400 to-sky-400 opacity-90" />
                        </h3>
                        <p className="mt-4 text-[#adb3d6] leading-relaxed">
                            Bible Game sits in the family of Worldle-style games (think Versle, Lordle, etc).
                            The twist is <em>how</em> the Bible is displayed: a star-map view
                            that helps you memorise where books and events live in relation to each other.
                            As you play, you build a mental map of Scripture.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {[
                                "Daily chapter",
                                "One-line summary",
                                "Guided hints",
                                "Share results",
                                "Learn the Bible’s shape",
                            ].map((pill) => (
                                <span
                                    key={pill}
                                    className="text-xs text-blue-100 px-3 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/25 backdrop-blur-sm"
                                >
                  {pill}
                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Vision */}
                <section className="w-full mb-10">
                    <h2 className="text-lg font-bold tracking-wide mb-3">Vision</h2>
                    <div className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-6 text-[#adb3d6] space-y-4">
                        <p>
                            Studying the Bible is central to Christian life, but it can be hard to see
                            the structure—how books relate, where stories sit, and how the grand narrative
                            unfolds. Bible Game helps you <em>visualise</em> that structure while you play:
                            a little learning each day, reinforced by repetition and discovery.
                        </p>
                        <p>
                            The long-term goal is to encourage reading the day’s passage,
                            track coverage across Scripture, and unlock further rounds that
                            deepen understanding. Playing is made social and encourages collaboration with
                            shared results and a leaderboard.
                        </p>
                    </div>
                </section>
            </div>

            {/* Edge-to-edge GIF Hero */}
            <section className="relative w-full mb-10">
                <div className="inset-0 bg-black/05 flex flex-col items-center justify-end text-center px-4 mb-12">
                    <h2 className="text-2xl md:text-4xl font-extrabold tracking-wide">
                        See the Bible Like Never Before
                    </h2>
                    <p className="mt-3 text-sm md:text-lg text-[#e0e6ff] max-w-2xl">
                        Build a mental map of Scripture while playing a fun daily guessing game.
                    </p>
                </div>
                <img
                    src="/bible-game.gif"
                    alt="Bible Game gameplay preview"
                    className="w-full h-[320px] md:h-[480px] object-cover"
                />
            </section>

            {/* Gameplay + Footer inside container */}
            <div className="w-full mx-auto px-6 md:px-12">
                <section className="w-full">
                    <h2 className="text-lg font-bold tracking-wide mb-3">Gameplay</h2>
                    <div className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-6">
                        <ul className="list-disc list-inside text-[#adb3d6] space-y-2">
                            <li>A random Bible chapter is chosen each day and summarised in a short sentence.</li>
                            <li>
                                Guess by clicking the map or using the dropdowns.
                            </li>
                            <li>
                                Each incorrect guess gives a nudges: a ▲/▼ (before/after) arrow and the number of verses
                                away from the answer.
                            </li>
                            <li>Parts of the map outside a correctly guessed section are greyed out to focus your
                                search.
                            </li>
                            <li>
                                You have <strong>5 attempts</strong> before the answer is revealed.
                            </li>
                        </ul>
                    </div>
                </section>

                <footer
                    className="mt-14 py-4 border-t border-dashed border-white/20 text-sm text-[#adb3d6] flex justify-between flex-wrap gap-2">
                    <span>© {new Date().getFullYear()} Bible Game</span>
                    <span>Made for curious readers and visual learners.</span>
                </footer>
            </div>
        </main>
    );
}
