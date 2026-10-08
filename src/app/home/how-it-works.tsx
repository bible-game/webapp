"use client";

import React from "react";
import Link from "next/link";
import { BookOpenIcon, LightbulbIcon } from "lucide-react";
import { Guesses } from "@/app/play/[game]/guess";
import { playTheme } from "@/core/style/play-theme";

// One worked example throughout: Revelation 12, found on the fourth guess
const clue = "A cosmic battle ensues between…";
const guesses = [
    { book: "Numbers", chapter: 31, closeness: { distance: -28400 } },
    { book: "Hebrews", chapter: 4, closeness: { distance: -930 } },
    { book: "Revelation", chapter: 16, closeness: { distance: 63 } },
    { book: "Revelation", chapter: 12, closeness: { distance: 0 } },
];

type Block = { x: number; y: number; w: number; h: number; colour: string; xs?: number[]; ys?: number[] };

// A sketch of Play's map: each division outlined in its colour, with a few books marked inside
const blocks: Block[] = [
    { x: 0, y: 0, w: 58, h: 84, colour: playTheme.teal, ys: [20, 40, 62] },
    { x: 60, y: 0, w: 92, h: 40, colour: playTheme.purple, xs: [90, 120], ys: [20] },
    { x: 60, y: 42, w: 92, h: 42, colour: playTheme.rose, xs: [100] },
    { x: 154, y: 0, w: 70, h: 84, colour: playTheme.green, ys: [30, 58] },
    { x: 226, y: 0, w: 74, h: 84, colour: playTheme.gold, xs: [250, 275], ys: [42] },
    { x: 0, y: 90, w: 92, h: 42, colour: playTheme.gold, xs: [23, 46, 69] },
    { x: 94, y: 90, w: 40, h: 42, colour: playTheme.green },
    { x: 136, y: 90, w: 120, h: 42, colour: playTheme.teal, xs: [160, 184, 208, 232], ys: [111] },
    { x: 258, y: 90, w: 42, h: 42, colour: playTheme.purple },
];

function MiniMap() {
    return <svg viewBox="-1 -1 302 134" className="w-full" aria-hidden="true">
        <defs>
            <pattern id="mini-map-dots" width={6} height={6} patternUnits="userSpaceOnUse">
                <circle cx={3} cy={3} r={0.7} fill="#fff" opacity={0.14}/>
            </pattern>
        </defs>
        {blocks.map(({ x, y, w, h, colour, xs = [], ys = [] }) => <g key={`${x}-${y}`} stroke={colour} strokeWidth={1}>
            <rect x={x} y={y} width={w} height={h} rx={2} fill="url(#mini-map-dots)" strokeOpacity={0.75}/>
            {xs.map(lx => <line key={lx} x1={lx} x2={lx} y1={y} y2={y + h} strokeOpacity={0.35}/>)}
            {ys.map(ly => <line key={ly} x1={x} x2={x + w} y1={ly} y2={ly} strokeOpacity={0.35}/>)}
        </g>)}
        <rect x={272} y={101} width={12} height={12} rx={2} fill={playTheme.purple} className="mini-map-found"/>
    </svg>;
}

const panel = "flex items-center justify-center rounded-lg border border-ui-line bg-ui-surface px-4 py-6";

const steps: { title: string; detail: string; art: React.ReactNode }[] = [
    {
        title: "Read today's clue",
        detail: "Every day brings a new chapter, described in a single line.",
        art: <div className={panel}><p className="font-clue text-[20px] italic text-ui-text">{clue}</p></div>,
    },
    {
        title: "Find it on the map",
        detail: "The whole Bible is laid out as one map. Tap the chapter you think it is.",
        art: <div className={panel}><MiniMap/></div>,
    },
    {
        title: "Get closer with every guess",
        detail: "Each guess shows how many verses away the answer is, and in which direction. You have five.",
        art: <div className={`${panel} [&_ol]:px-0`}><Guesses guesses={guesses}/></div>,
    },
    {
        title: "Then read it and study it",
        detail: "Read the whole chapter, then test what you remember with a short study.",
        art: <div className="flex gap-3">
            <Link href="/read" className="ui-button flex-1"><BookOpenIcon className="size-4 text-play-teal"/>Read</Link>
            <Link href="/study" className="ui-button flex-1"><LightbulbIcon className="size-4 text-play-purple"/>Study</Link>
        </div>,
    },
];

export default function HowItWorks() {
    return <section aria-labelledby="how-it-works" className="mx-auto w-full max-w-[28rem]">
        <h2 id="how-it-works" className="text-[20px] font-semibold">How it works</h2>
        <ol className="mt-8 grid gap-12">
            {steps.map(({ title, detail, art }, index) => <li key={title}>
                <div className="flex items-baseline gap-3">
                    <span className="flex size-6 shrink-0 translate-y-[-1px] items-center justify-center self-center rounded-full border border-ui-line text-[12px] font-semibold text-ui-muted">{index + 1}</span>
                    <h3 className="text-[17px] font-semibold">{title}</h3>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-ui-muted">{detail}</p>
                <div className="mt-4">{art}</div>
            </li>)}
        </ol>
    </section>;
}
