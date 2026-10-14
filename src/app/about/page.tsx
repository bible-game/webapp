"use client";

import Link from "next/link";
import { Mail, Play } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { useState } from "react";

const button = "ui-button h-12 !px-5 !text-[16px] [&_svg]:size-5";
const heading = "text-[18px] font-semibold leading-6";
const body = "text-[16px] leading-6 text-ui-muted";

const gameplay = [
    "A random Bible chapter is chosen each day and summarised in a short sentence.",
    "Guess by tapping the map.",
    "Each incorrect guess shows an arrow (before or after) and the number of verses away from the answer.",
    "Parts of the map outside a correctly guessed section are dimmed to focus your search.",
    "You have 5 attempts before the answer is revealed.",
];

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
        <main className="app-page !pt-5">
            <header>
                <div className="flex items-start gap-3">
                    <img src="/icon-nobg.png" alt="" className="size-10 shrink-0"/>
                    <div className="min-w-0">
                        <h1 className="text-[22px] font-semibold leading-7">About Bible Game</h1>
                        <p className="mt-0.5 text-[14px] leading-5 text-ui-muted">A daily Bible passage-guessing game</p>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                    <Link href="/play/today" className={button}><Play/>Play</Link>
                    <a href="https://github.com/bible-game" target="_blank" rel="noopener noreferrer" className={button}><SiGithub color="currentColor" title="" aria-hidden="true"/>GitHub</a>
                    <button type="button" onClick={handleCopyEmail} aria-live="polite" className={`${button} relative`}>
                        <Mail/>hello@bible.game
                        {copied && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-ui-success">Copied!</span>}
                    </button>
                </div>
            </header>

            <section className="mt-[30px]">
                <h2 className={heading}>Vision</h2>
                <div className={`mt-3 space-y-4 ${body}`}>
                    <p>
                        Studying the Bible is central to Christian life, but it can be hard to picture it’s structure - how books relate,
                        where stories sit, and how the grand narrative unfolds. Bible Game helps you visualise that structure while you play:
                        plus a little learning each day, reinforced by repetition and discovery.
                    </p>
                    <p>
                        The long-term goal is to encourage reading the day’s passage, track coverage across Scripture, and unlock further
                        rounds that deepen understanding. Collaboration is encouraged, with shared results and a leaderboard.
                    </p>
                </div>
            </section>

            <section className="mt-[30px]">
                <h2 className={heading}>Gameplay</h2>
                {/* Edge to edge on a phone: a band through the middle of the map */}
                <img src="/gameplay.png" alt="The Bible Game map, with each region outlined in its colour"
                     className="mt-6 aspect-[360/220] w-[calc(100%+32px)] max-w-none -mx-4 object-cover object-[50%_53%] min-[441px]:-mx-6 min-[441px]:w-[calc(100%+48px)]"/>
                <ul className={`mt-6 space-y-2 ${body}`}>
                    {gameplay.map(point => <li key={point} className="list-inside list-disc">{point}</li>)}
                </ul>
            </section>

            <footer className="mt-10 border-t border-ui-line pt-2 text-[14px] leading-5 text-ui-muted">
                © {new Date().getFullYear()} Bible Game
            </footer>
        </main>
    );
}
