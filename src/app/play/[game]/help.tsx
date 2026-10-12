"use client"

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { ArrowDownIcon, ArrowUpIcon, PartyPopperIcon } from "lucide-react";
import { Band, CLOSE, FAR, NEAR, foundBand } from "@/app/play/[game]/closeness";
import { playTheme } from "@/core/style/play-theme";

const examples: { band: Band, passage: string, up: boolean, distance?: string, meaning: string }[] = [
    { band: CLOSE, passage: "ACT 14", up: false, distance: "300", meaning: "Within 500 verses" },
    { band: NEAR, passage: "ROM 2", up: true, distance: "1.2K", meaning: "Within 2,000 verses" },
    { band: FAR, passage: "NUM 31", up: false, distance: "28K", meaning: "Further away" },
    { band: foundBand(playTheme.teal), passage: "NUM 9", up: false, meaning: "Found, in its region's colour" },
];

/**
 * How to Play: a popover above whatever trigger it wraps (the footer's info button), in the same style as the login warning's
 * @since 2nd October 2026
 */
const Help = ({ children }: { children: React.ReactElement }) => (
    <Popover placement="top-start" offset={12} showArrow classNames={{
        content: "play-ui w-[calc(100vw-2rem)] max-w-[20rem] items-stretch rounded-lg border border-play-line bg-play-surface p-4 text-play-text shadow-xl",
        arrow: "bg-play-surface",
    }}>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent>
            <div className="flex flex-col gap-3 text-[14px] leading-[1.45]">
                <p className="text-[14px] font-semibold">How to play</p>
                <p>Each day, one chapter of the Bible is chosen and summarised. Can you find it?</p>
                <p>Tap the map to pick a chapter, then guess. You have five guesses.</p>
                <p className="text-play-muted">Each guess shows how many verses away the answer is, and in which direction. The closer the guess, the brighter its tile:</p>
                <ul className="grid gap-2">
                    {examples.map(({ band, passage, up, distance, meaning }) => {
                        const Arrow = up ? ArrowUpIcon : ArrowDownIcon;
                        return (
                            <li key={passage} className="flex items-center gap-3">
                                <span className="flex h-9 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-lg border font-mono text-[12px] font-medium leading-[1.15] tabular-nums"
                                      style={{ background: band.fill, borderColor: band.edge, color: band.text }}>
                                    {passage}
                                    {distance ?
                                        <span className="flex items-center gap-0.5"><Arrow className="size-3" strokeWidth={2.5}/>{distance}</span> :
                                        <PartyPopperIcon className="size-3.5" aria-label="Found"/>}
                                </span>
                                <span className="text-play-muted">{meaning}</span>
                            </li>
                        );
                    })}
                </ul>
                <p className="text-play-muted">
                    <ArrowUpIcon className="inline size-3.5 align-[-2px]" strokeWidth={2.5}/> the answer is later in the Bible,{" "}
                    <ArrowDownIcon className="inline size-3.5 align-[-2px]" strokeWidth={2.5}/> earlier.
                </p>
                <p className="text-[13px] text-play-faint">Feedback? hello@bible.game</p>
            </div>
        </PopoverContent>
    </Popover>
);

export default Help;
