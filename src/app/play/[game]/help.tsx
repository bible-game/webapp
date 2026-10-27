"use client"

import React from "react";
import { Popover, PopoverContent, type PopoverProps, PopoverTrigger } from "@heroui/react";
import { ArrowLeftIcon, ArrowRightIcon, PartyPopperIcon } from "lucide-react";
import { Band, bandOf, CLOSE, distanceOf, FAR, FOUND, NEAR } from "@/app/play/[game]/closeness";
import { compact, Direction, formatPassage } from "@/app/play/[game]/guess";
import { exampleGuesses } from "@/app/play/[game]/example";

const meanings = new Map<Band, string>([
    [CLOSE, "Within 500 verses"],
    [NEAR, "Within 2,000 verses"],
    [FAR, "Further away"],
    [FOUND, "Found it"],
]);

// The worked example from How it works, in the order it was played: far, nearer, close, found.
// Band, arrow and distance come from the game's own rules
const examples = exampleGuesses.map(guess => {
    const distance = distanceOf(guess);
    const band = bandOf(guess);
    return {
        band,
        passage: formatPassage(guess.book, guess.chapter),
        later: distance < 0,
        distance: distance ? compact.format(Math.abs(distance)) : undefined,
        meaning: meanings.get(band)!,
    };
});

/**
 * How to Play: a popover above whatever trigger it wraps (the footer's info button, or an already-guessed guess button),
 * in the same style as the login warning's
 * @since 2nd October 2026
 */
const Help = ({ children, placement = "top-start" }: { children: React.ReactElement, placement?: PopoverProps["placement"] }) => (
    <Popover placement={placement} offset={12} showArrow classNames={{
        content: "play-ui w-[calc(100vw-2rem)] max-w-[20rem] items-stretch rounded-lg border border-play-line bg-play-sheet p-4 text-play-text shadow-xl",
        arrow: "bg-play-sheet",
    }}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent>
            <div className="flex flex-col gap-3 text-[14px] leading-[1.45]">
                <p className="text-[14px] font-semibold">How to play</p>
                <p>Each day, one chapter of the Bible is chosen and summarised. Can you find it?</p>
                <p>Tap the map to pick a chapter, then guess. You have five guesses.</p>
                <p className="text-play-muted">Each guess shows how many verses away the answer is, and in which direction. Red is far, yellow is nearer, green is close:</p>
                <ul className="grid gap-2">
                    {examples.map(({ band, passage, later, distance, meaning }) => (
                        <li key={passage} className="flex items-center gap-3">
                            <span className="flex h-9 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-lg border font-mono text-[12px] font-medium leading-[1.15] tabular-nums"
                                  style={{ background: band.fill, borderColor: band.edge, color: band.text }}>
                                {passage}
                                {distance ?
                                    <Direction later={later} distance={distance} className="size-3"/> :
                                    <PartyPopperIcon className="size-3.5" aria-label="Found"/>}
                            </span>
                            <span className="text-play-muted">{meaning}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-play-muted">
                    <ArrowRightIcon className="inline size-3.5 align-[-2px]" strokeWidth={2.5}/> the answer is later in the Bible,{" "}
                    <ArrowLeftIcon className="inline size-3.5 align-[-2px]" strokeWidth={2.5}/> earlier.
                </p>
                <p className="text-[13px] text-play-faint">Feedback? hello@bible.game</p>
            </div>
        </PopoverContent>
    </Popover>
);

export default Help;
