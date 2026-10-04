"use client"

import React from "react";
import { PartyPopperIcon } from "lucide-react";
import { ANSWER, Band, bandOf, distanceOf } from "@/app/play/[game]/closeness";

const compact = Intl.NumberFormat("en", { notation: "compact" });

export function formatPassage(book: any, chapter: any): string {
    if (!book || !chapter) return "";
    return `${book.substring(0, book.split(" ").length > 1 ? 4 : 3).toUpperCase()} ${chapter}`;
}

const GAP = 2; // px between tiles

/** Past four tiles the passage sits above the distance, so the text can stay legible on narrow phones */
const stacked = (count: number) => count > 4;

/**
 * Text scales with the tile's width (a share of the row, via container units) so every tile keeps its passage and
 * distance; each layout needs roughly this many ems of width, e.g. "PSA 119 ▼ 28K" plus padding.
 */
function fontSize(count: number): string {
    const [max, ems] = stacked(count) ? [10.5, 5.2] : [13, 8.6];
    return `min(${max}px, calc((100cqw - ${(count - 1) * GAP}px) / ${count} / ${ems}))`;
}

const Tile = ({ band, count, children }: { band: Band, count: number, children: React.ReactNode }) => (
    <li className={"flex h-6 min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap px-[0.45em] font-semibold " +
        (stacked(count) ? "flex-col justify-center leading-[1.1]" : "justify-between gap-[0.3em]")}
        style={{ background: band.fill, color: band.text, fontSize: fontSize(count) }}>
        {children}
    </li>
);

/**
 * Guess Tile: passage, direction and distance, coloured by how close it was
 */
const Guess = ({ guess, count }: { guess: any, count: number }) => {
    const distance = distanceOf(guess);

    return (
        <Tile band={bandOf(guess)} count={count}>
            <span>{formatPassage(guess.bookKey || guess.book, guess.chapter)}</span>
            {distance === 0 ?
                <PartyPopperIcon className="size-[1.3em] shrink-0" aria-label="Found"/> :
                <span className="flex items-center gap-[0.4em]">
                    <span className="text-[0.75em]">{distance < 0 ? "▲" : "▼"}</span>
                    {compact.format(Math.abs(distance))}
                </span>
            }
        </Tile>
    );
}

/** Every guess in order, plus the missed answer when the game was lost */
export const Guesses = ({ guesses, answer }: { guesses: any[], answer?: any }) => {
    const count = guesses.length + (answer ? 1 : 0);

    return (
        <ol className="flex w-full [container-type:inline-size]" style={{ gap: GAP }}>
            {guesses.map((guess) => <Guess key={guess.book + guess.chapter} guess={guess} count={count}/>)}
            {answer ?
                <Tile band={ANSWER} count={count}>
                    <span className="sr-only">Answer: </span>
                    <span className="mx-auto">{formatPassage(answer.book, answer.chapter)}</span>
                </Tile> : null
            }
        </ol>
    );
}

export default Guess;
