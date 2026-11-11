"use client"

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, PartyPopperIcon } from "lucide-react";
import { ANSWER, Band, bandOf, deepestOf, DEPTH, distanceOf } from "@/app/play/[game]/closeness";

export const compact = Intl.NumberFormat("en", { notation: "compact" });

export function formatPassage(book: any, chapter: any): string {
    if (!book || !chapter) return "";
    return `${book.substring(0, book.split(" ").length > 1 ? 4 : 3).toUpperCase()} ${chapter}`;
}

export const SLOTS = 5; // guesses per game
const GAP = 6; // px between tiles

const key = (guess: any) => `${guess.book}${guess.chapter}`;

/**
 * Text scales with the tile's width (a share of the row, via container units) so every tile keeps its passage and
 * distance, stacked; each tile needs roughly 5.2em of width, e.g. "PSA 119" plus padding.
 */
function fontSize(count: number): string {
    return `min(12px, calc((100cqw - ${(count - 1) * GAP}px) / ${count} / 5.2))`;
}

/** A ring that swells out from a tile and fades: the "warmer" moment */
const Pulse = ({ colour }: { colour: string }) => (
    <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-lg border-2" style={{ borderColor: colour }}
                 initial={{ opacity: 0.9, scale: 1 }} animate={{ opacity: 0, scale: 1.3 }}
                 transition={{ duration: 0.9, ease: "easeOut", repeat: 1, repeatDelay: 0.1 }}/>
);

const Tile = ({ band, count, pulse, children }: { band: Band, count: number, pulse?: boolean, children: React.ReactNode }) => (
    <motion.li initial={{ opacity: 0, y: 6, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
               transition={{ type: "spring", stiffness: 420, damping: 28 }}
               className="relative flex h-9 min-w-0 flex-1 flex-col items-center justify-center whitespace-nowrap rounded-lg border px-[0.4em] font-mono font-medium leading-[1.15] tabular-nums"
               style={{ background: band.fill, borderColor: band.edge, color: band.text, boxShadow: band.glow, fontSize: fontSize(count) }}>
        {children}
        {pulse ? <Pulse colour={band.edge}/> : null}
    </motion.li>
);

/** A guess not yet made */
const Slot = () => (
    <li aria-hidden="true" data-empty="" className="h-9 min-w-0 flex-1 rounded-lg border border-dashed border-play-line"/>
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
 * Guess Tile: passage, direction and distance, coloured by how much of the answer's place the guess shares
 * (closeness.ts). A guess that reaches a narrower place than any before it (the right testament, division or book)
 * pulses as it lands: the "warmer" moment
 */
const Guess = ({ guess, count, pulse }: { guess: any, count: number, pulse?: boolean }) => {
    const distance = distanceOf(guess);

    return (
        <Tile band={bandOf(guess)} count={count} pulse={pulse}>
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

/**
 * Every guess in the order it was made, an empty slot for each one left, and the missed answer when the game was lost.
 * `latest` is the guess just made here (never one loaded with the page), for its pulse
 */
export const Guesses = ({ guesses, passage, playing, latest }: { guesses: any[], passage?: any, playing?: boolean, latest?: string | null }) => {
    const won = guesses.some((guess) => distanceOf(guess) === 0);
    const answer = playing === false && !won ? passage : undefined;
    const filled = guesses.length + (answer ? 1 : 0);
    const count = Math.max(SLOTS, filled);

    // the warmer moment: the guess just made, when it finds a narrower place than every guess before it
    const fresh = latest ? guesses.find((guess) => key(guess) === latest) : undefined;
    const before = deepestOf(guesses.filter((guess) => guess !== fresh));
    const deeper = !!fresh && DEPTH.indexOf(deepestOf([fresh])) > DEPTH.indexOf(before) && distanceOf(fresh) !== 0;

    return (
        <ol aria-label="Guesses" data-play-part="guesses" className="flex w-full px-4 [container-type:inline-size]" style={{ gap: GAP }}>
            {guesses.map((guess) => <Guess key={key(guess)} guess={guess} count={count} pulse={deeper && guess === fresh}/>)}
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
