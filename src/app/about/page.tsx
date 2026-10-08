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
        <main className="app-page">
            {/* Outer container for header + explanation + vision */}
            <div className="w-full">
                {/* Header */}
                <header className="flex flex-col items-start gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="size-12 grid place-items-center shrink-0">
                            <img src="/icon-nobg.png" alt="Bible Game icon" className="w-8 h-8" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-[24px] font-semibold">About Bible Game</h1>
                            <div className="text-sm text-ui-muted">
                                A daily Bible passage guessing game
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/play/today"
                            className="ui-button"
                        >
                            <Play size={16} /> Play
                        </Link>
                        <a
                            href="https://github.com/bible-game"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ui-button"
                        >
                            <Github size={16} /> GitHub
                        </a>
                        <button
                            onClick={handleCopyEmail}
                            className="ui-button relative"
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
                    <h2 className="text-lg font-bold tracking-normal mb-3">Explanation</h2>
                    <div className="legal-content">
                        <h3 className="inline-block pb-1 relative font-bold text-lg md:text-xl">
                            See the Bible Like Never Before
                        </h3>
                        <p className="mt-4 text-ui-muted leading-relaxed">
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
                                    className="text-xs text-ui-muted"
                                >
                  {pill}
                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Vision */}
                <section className="w-full mb-10">
                    <h2 className="text-lg font-bold tracking-normal mb-3">Vision</h2>
                    <div className="legal-content space-y-4">
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
                <div className="flex flex-col gap-2 mb-6">
                    <h2 className="text-[20px] font-semibold">
                        See the Bible Like Never Before
                    </h2>
                    <p className="mt-3 text-sm md:text-lg text-ui-muted max-w-2xl">
                        Build a mental map of Scripture while playing a fun daily guessing game.
                    </p>
                </div>
                <img
                    src="/gameplay.png"
                    alt="Bible Game gameplay preview"
                    className="w-full h-auto object-contain"
                />
            </section>

            {/* Gameplay + Footer inside container */}
            <div className="w-full">
                <section className="w-full">
                    <h2 className="text-lg font-bold tracking-normal mb-3">Gameplay</h2>
                    <div className="legal-content">
                        <ul className="list-disc list-inside text-ui-muted space-y-2">
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
                    className="mt-14 py-4 border-t border-ui-line text-sm text-ui-muted flex justify-between flex-wrap gap-2">
                    <span>© {new Date().getFullYear()} Bible Game</span>
                    <span>Made for curious readers and visual learners.</span>
                </footer>
            </div>
        </main>
    );
}
