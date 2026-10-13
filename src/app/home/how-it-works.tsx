"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpenIcon, ChartColumnIcon, FlameIcon, LightbulbIcon, StarIcon } from "lucide-react";
import { Guesses } from "@/app/play/[game]/guess";
import { playTheme } from "@/core/style/play-theme";

// One worked example throughout: Revelation 12, found on the fourth guess
const clue = "A cosmic battle ensues between good and evil";
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
    { x: 0, y: 90, w: 80, h: 42, colour: playTheme.gold, xs: [20, 40, 60] },
    { x: 82, y: 90, w: 34, h: 42, colour: playTheme.green },
    { x: 118, y: 90, w: 100, h: 42, colour: playTheme.teal, xs: [138, 158, 178, 198], ys: [111] },
    { x: 220, y: 90, w: 36, h: 42, colour: playTheme.rose, xs: [238], ys: [111] },
    { x: 258, y: 90, w: 42, h: 42, colour: playTheme.purple },
];

// Revelation's 22 chapters, five to a row, shown once the map is zoomed in; chapter 12 is the answer
const revelation = { x: 258, y: 90, size: 8.4, columns: 5, chapters: 22 };
const chapterCell = (chapter: number) => ({
    x: revelation.x + ((chapter - 1) % revelation.columns) * revelation.size,
    y: revelation.y + Math.floor((chapter - 1) / revelation.columns) * revelation.size,
});
const answer = chapterCell(12);

// Zoom towards Revelation, tap chapter 12, then zoom back out (looped in globals.sass). The loop
// starts from the whole map each time the sketch scrolls into view, and stays still under reduced motion
function MiniMap() {
    const { size } = revelation;
    const ref = useRef<SVGSVGElement>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const svg = ref.current;
        if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.75 });
        observer.observe(svg);
        return () => observer.disconnect();
    }, []);

    return <svg ref={ref} viewBox="0 0 300 132" className="mini-map w-full overflow-hidden" data-playing={playing || undefined} aria-hidden="true">
        <defs>
            <pattern id="mini-map-dots" width={6} height={6} patternUnits="userSpaceOnUse">
                <circle cx={3} cy={3} r={0.7} fill="#fff" opacity={0.14}/>
            </pattern>
        </defs>
        <g className="mini-map-zoom">
            {blocks.map(({ x, y, w, h, colour, xs = [], ys = [] }) => <g key={`${x}-${y}`} stroke={colour} strokeWidth={1}
                className={x === revelation.x && y === revelation.y ? undefined : "mini-map-context"}>
                <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={2} fill="url(#mini-map-dots)" strokeOpacity={0.75} vectorEffect="non-scaling-stroke"/>
                {xs.map(lx => <line key={lx} x1={lx} x2={lx} y1={y} y2={y + h} strokeOpacity={0.35} vectorEffect="non-scaling-stroke"/>)}
                {ys.map(ly => <line key={ly} x1={x} x2={x + w} y1={ly} y2={ly} strokeOpacity={0.35} vectorEffect="non-scaling-stroke"/>)}
            </g>)}
            <g className="mini-map-chapters">
                {[...Array(revelation.chapters)].map((_, index) => {
                    const { x, y } = chapterCell(index + 1);
                    return <g key={index}>
                        <rect x={x + 0.6} y={y + 0.6} width={size - 1.2} height={size - 1.2} rx={0.8} fill="none" stroke={playTheme.purple} strokeOpacity={0.4} vectorEffect="non-scaling-stroke"/>
                        <text x={x + size / 2} y={y + size / 2} className="mini-map-number">{index + 1}</text>
                    </g>;
                })}
            </g>
            <g className="mini-map-found">
                <rect x={answer.x + 0.6} y={answer.y + 0.6} width={size - 1.2} height={size - 1.2} rx={0.8} fill={playTheme.purple}/>
                <text x={answer.x + size / 2} y={answer.y + size / 2} className="mini-map-number mini-map-found-number">12</text>
            </g>
            <circle cx={answer.x + size / 2} cy={answer.y + size / 2} r={size / 2} fill="none" stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" className="mini-map-ripple"/>
            <circle cx={answer.x + size / 2} cy={answer.y + size / 2} r={size * 0.55} fill="#fff" fillOpacity={0.22} stroke="#fff" strokeOpacity={0.9} strokeWidth={1.5} vectorEffect="non-scaling-stroke" className="mini-map-tap"/>
        </g>
    </svg>;
}

// An example of the figures on Statistics
const figures = [
    { label: "Stars", value: 42, icon: StarIcon, colour: "text-ui-accent" },
    { label: "Day streak", value: 9, icon: FlameIcon, colour: "text-ui-orange" },
    { label: "Bible seen", value: "4%", icon: BookOpenIcon, colour: "text-ui-text" },
];

const panel = "flex items-center justify-center rounded-lg border border-ui-line bg-ui-surface px-4 py-6";
const button = "ui-button h-12 text-[16px] [&_svg]:size-5";

// A "\n" in a detail is a line break from the design, kept at every width
const steps: { title: string; detail: string; art: React.ReactNode }[] = [
    {
        title: "Read the summary",
        detail: "Each day brings a new chapter;\nsummarised in four to seven words.",
        art: <div className={`${panel} px-8 py-2.5`}><p className="text-balance text-center font-clue text-[18px] leading-[30px] text-ui-text">{clue}</p></div>,
    },
    {
        title: "Select the chapter",
        detail: "The Bible is displayed as one map.\nZoom and tap the chapter you think it is.",
        art: <div className={panel}><MiniMap/></div>,
    },
    {
        title: "Narrow your guess",
        detail: "Your five guesses reveal how many verses away the answer is, and in which direction.",
        art: <div className={`${panel} [&_ol]:px-0`}><Guesses guesses={guesses}/></div>,
    },
    {
        title: "Read and study",
        detail: "Read the chapter, then test what you remember with a short study.",
        art: <div className="flex gap-3">
            <Link href="/read" className={`${button} flex-1`}><BookOpenIcon/>Read</Link>
            <Link href="/study" className={`${button} flex-1`}><LightbulbIcon/>Study</Link>
        </div>,
    },
    {
        title: "Track your progress",
        detail: "Collect stars, keep your streak going, and see how much of the Bible you\u2019ve explored.",
        art: <div className="grid gap-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-[18px] rounded-lg border border-ui-line bg-ui-surface p-4">
                {figures.map(({ label, value, icon: Icon, colour }) => <div key={label}>
                    <dt className="flex items-center gap-2 text-[16px] text-ui-muted"><Icon className={`size-5 ${colour}`}/>{label}</dt>
                    <dd className="mt-1 text-[32px] font-semibold leading-[38px] tabular-nums">{value}</dd>
                </div>)}
            </dl>
            <Link href="/stats" className={button}><ChartColumnIcon/>Statistics</Link>
        </div>,
    },
];

export default function HowItWorks() {
    return <section aria-labelledby="how-it-works" className="mx-auto w-full max-w-[28rem]">
        <h2 id="how-it-works" className="text-[22px] font-semibold leading-[28px]">How it works</h2>
        <ol className="mt-8 grid gap-12">
            {steps.map(({ title, detail, art }, index) => <li key={title}>
                <div className="flex items-baseline gap-3">
                    <span className="w-4 shrink-0 font-mono text-[12px] font-medium tabular-nums text-ui-faint">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="text-[18px] font-semibold leading-[24px]">{title}</h3>
                </div>
                <p className="mt-2.5 whitespace-pre-line text-[16px] leading-[24px] text-ui-muted">{detail}</p>
                <div className="mt-[18px]">{art}</div>
            </li>)}
        </ol>
    </section>;
}
