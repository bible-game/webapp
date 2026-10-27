"use client"

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, PartyPopperIcon } from "lucide-react";
import { ANSWER, Band, bandOf, distanceOf } from "@/app/play/[game]/closeness";

export const compact = Intl.NumberFormat("en", { notation: "compact" });

export function formatPassage(book: any, chapter: any): string {
    if (!book || !chapter) return "";
    return `${book.substring(0, book.split(" ").length > 1 ? 4 : 3).toUpperCase()} ${chapter}`;
}

export const SLOTS = 5; // guesses per game
const GAP = 6; // px between tiles

/**
 * Text scales with the tile's width (a share of the row, via container units) so every tile keeps its passage and
 * distance, stacked; each tile needs roughly 5.2em of width, e.g. "PSA 119" plus padding.
 */
function fontSize(count: number): string {
    return `min(12px, calc((100cqw - ${(count - 1) * GAP}px) / ${count} / 5.2))`;
}

const Tile = ({ band, count, children }: { band: Band, count: number, children: React.ReactNode }) => (
    <motion.li initial={{ opacity: 0, y: 6, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
               transition={{ type: "spring", stiffness: 420, damping: 28 }}
               className="flex h-9 min-w-0 flex-1 flex-col items-center justify-center overflow-hidden whitespace-nowrap rounded-lg border px-[0.4em] font-mono font-medium leading-[1.15] tabular-nums"
               style={{ background: band.fill, borderColor: band.edge, color: band.text, boxShadow: band.glow, fontSize: fontSize(count) }}>
        {children}
    </motion.li>
);

/** A guess not yet made */
const Slot = () => (
    <li aria-hidden="true" className="h-9 min-w-0 flex-1 rounded-lg border border-dashed border-play-line"/>
);

/**
 * Direction and distance, read like a page: an arrow pointing right, after the distance, when the answer is later in the
 * Bible; pointing left, before it, when earlier
 */
export const Direction = ({ later, distance, className }: { later: boolean, distance: string, className: string }) => (
    later ?
        <span className="flex items-center gap-[0.15em]">
            {distance}<ArrowRightIcon className={className} strokeWidth={2.5} aria-label="answer is later"/>
        </span> :
        <span className="flex items-center gap-[0.15em]">
            <ArrowLeftIcon className={className} strokeWidth={2.5} aria-label="answer is earlier"/>{distance}
        </span>
);

/**
 * Guess Tile: passage, direction and distance, lit by how close it was (the found chapter takes its region colour)
 */
const Guess = ({ guess, count }: { guess: any, count: number }) => {
    const distance = distanceOf(guess);

    return (
        <Tile band={bandOf(guess)} count={count}>
            <span>{formatPassage(guess.bookKey || guess.book, guess.chapter)}</span>
            {distance === 0 ?
                <PartyPopperIcon className="size-[1.2em] shrink-0" aria-label="Found"/> :
                <span className="font-medium opacity-90">
                    <Direction later={distance < 0} distance={compact.format(Math.abs(distance))} className="size-[1em]"/>
                </span>
            }
        </Tile>
    );
}

/** Every guess in order, an empty slot for each one left, and the missed answer when the game was lost */
export const Guesses = ({ guesses, answer }: { guesses: any[], answer?: any }) => {
    const filled = guesses.length + (answer ? 1 : 0);
    const count = Math.max(SLOTS, filled);

    return (
        <ol aria-label="Guesses" className="flex w-full px-4 [container-type:inline-size]" style={{ gap: GAP }}>
            {guesses.map((guess) => <Guess key={guess.book + guess.chapter} guess={guess} count={count}/>)}
            {answer ?
                <Tile band={ANSWER} count={count}>
                    <span className="text-[0.85em] font-medium uppercase tracking-wide opacity-70">Answer</span>
                    <span>{formatPassage(answer.bookKey || answer.book, answer.chapter)}</span>
                </Tile> : null
            }
            {[...Array(count - filled)].map((_, index) => <Slot key={`slot-${index}`}/>)}
        </ol>
    );
}

export default Guess;
