"use client"

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, ChartColumnIcon, ChevronDownIcon, LightbulbIcon, PlayIcon, UserRoundIcon, UserRoundPlusIcon } from "lucide-react";
import GlowingCross from "@/app/home/glowing-cross";
import AppHeader from "@/core/component/app-header";
import { liveMap, withLiveMap } from "@/app/play/[game]/tutorial/map-handle";
import type { GridmapCell } from "@project-gridmap/library";
import { DivisionUtil } from "@/core/util/division-util";
import { abbreviation } from "@/core/util/book-abbreviation";
import { playTheme } from "@/core/style/play-theme";
import "@/app/home/landing.sass";

/**
 * The resting places, down the scroll: the hero, as the Bible Game's home has it (what the game is, and Play); the
 * purpose, its words at the head and the day's four steps down the page, arriving one by one the first time; then
 * today's game, the map at its size on Play, today's clue under the question it asks, and the way in where Play keeps
 * its buttons
 */
type Stop = { kind: "hero" | "purpose" | "close"; rest: number };
/** The three stops, and where each rests down the scroll (svh) */
const STOPS_DOWN: Stop[] = [{ kind: "hero", rest: 0 }, { kind: "purpose", rest: 100 }, { kind: "close", rest: 200 }];
/** From one step's arrival to the next's, on the purpose (ms) */
const STEP_EVERY = 650;

/** The flow's words, set as a clue is in the clue's place, under a quiet heading */
const FLOW_HEADING = "Purpose";
const FLOW_WORDS = "Explore the human story";

/** Who the visitor is to us: a guest we don't know, one whose account we know (logged in on this device before), or a member */
export type LandingAccount = "guest" | "known" | "member";

/** Today's game: the question the clue asks, as its quiet heading */
const CLOSE_WORDS = "Can you find today’s chapter?";

/** The purpose's words (and today's clue), in the clue's own type (summary.tsx) */
const CLUE = "font-mono text-[18px] font-normal leading-[1.45] tracking-normal text-play-text text-center text-balance";


/**
 * The four steps, in the order a day takes them, along a line across the page, joined by a hairline that runs from
 * one step's colour into the next's (the B's runs, cool to warm, as the emblem's stones go). Each star is the step's own
 * menu icon (app-header.tsx) in a small lit circle of its colour; beneath it its number and name, small in the mono
 * capitals, the name in its colour, and a muted line on what it's for
 */
const STOPS = [
    { number: "01", name: "Play", what: "Visualise the Bible", icon: PlayIcon, colour: playTheme.teal, href: "/play/today" },
    { number: "02", name: "Read", what: "Digest today’s chapter", icon: BookOpenIcon, colour: playTheme.purple, href: "/read" },
    { number: "03", name: "Study", what: "Stretch your understanding", icon: LightbulbIcon, colour: playTheme.rose, href: "/study" },
    { number: "04", name: "Stats", what: "Track your progress", icon: ChartColumnIcon, colour: playTheme.gold, href: "/stats" },
];
/** How long the line to a step takes to draw, and so how long the step waits to light (s) */
const LINE_FOR = 0.6;
/** A colour at an opacity, from its hex */
const tint = (hex: string, a: number) => `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

/**
 * A step's star. Nothing until its turn; then it lights: a circle of its colour, tinted within, its edge drawn finely, in a soft halo, and in it the step's icon
 * in the colour, as the menu draws it
 */
function Star({ colour, icon: Icon, ring, size, lit, delay, still }: { colour: string; icon: typeof PlayIcon; ring: number; size: number; lit: boolean; delay: number; still?: boolean }) {
    const ease = { duration: 0.5, ease: [0.22, 0.8, 0.24, 1] as const, delay: lit ? delay : 0 };
    return <g>
        <motion.g initial={still ? false : { opacity: 0, scale: 0.6 }} animate={lit ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }} transition={ease}>
            <circle r={ring * 1.22} fill={tint(colour, 0.07)}/>
            <circle r={ring} fill={tint(colour, 0.12)} stroke={tint(colour, 0.55)} strokeWidth={1}/>
            <Icon x={-size / 2} y={-size / 2} width={size} height={size} color={colour} strokeWidth={1.5}/>
        </motion.g>
    </g>;
}

/**
 * The steps, `shown` of them (0 to 4), down the page: a star each, the stars in a column joined by a hairline that
 * draws on from one to the next, and beside each its number and name in the mono capitals (the name in its colour)
 * with its line beneath. They arrive one by one, the line first, then the star and its words; `still` shows them as
 * they are, without arriving again (a story already told). Spread over the room they have (`room`, px), a quarter each,
 * from beneath the purpose to above the foot. Each step, star
 * and words together, goes to its page (Play by the landing's own way in, `onPlay`)
 */
function Steps({ shown, room, still, onPlay }: { shown: number; room: number; still: boolean; onPlay: () => void }) {
    // the room shared out between the four, so they span it from the purpose to the foot
    const row = Math.round(Math.max(64, room / STOPS.length));
    const ring = Math.round(Math.min(30, Math.max(18, row * 0.2)));
    const x = Math.round(ring * 1.3);
    const y = (i: number) => i * row + row / 2;
    const gap = ring * 1.22 + 4;
    const height = row * STOPS.length;

    return <div className="relative mx-auto w-full max-w-[20rem]" style={{ height }}>
        {/* the line between the stars, behind them */}
        <svg width={x * 2} height={height} className="pointer-events-none absolute left-0 top-0 overflow-visible" aria-hidden="true">
            <defs>
                {STOPS.slice(1).map((to, i) => <linearGradient key={i} id={`steps-${i}`} gradientUnits="userSpaceOnUse" x1={x} y1={y(i)} x2={x} y2={y(i + 1)}>
                    <stop offset="0" stopColor={STOPS[i].colour}/><stop offset="1" stopColor={to.colour}/>
                </linearGradient>)}
            </defs>
            {STOPS.slice(1).map((_, i) => {
                const drawn = i + 1 < shown;
                return <motion.line key={i} x1={x} y1={y(i) + gap} x2={x} y2={y(i + 1) - gap} stroke={`url(#steps-${i})`} strokeWidth={1}
                                    initial={still ? false : { pathLength: 0, opacity: 0 }} animate={drawn ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
                                    transition={{ duration: drawn ? LINE_FOR : 0.15, ease: [0.45, 0, 0.25, 1] }}/>;
            })}
        </svg>
        <ol className="relative">
            {STOPS.map(({ number, name, what, icon, colour, href }, i) => {
                const lit = i < shown;
                const delay = i === 0 ? 0.1 : LINE_FOR * 0.85;
                const inside = <>
                    <svg width={x * 2} height={row} viewBox={`${-x} ${-row / 2} ${x * 2} ${row}`} className="shrink-0 overflow-visible" aria-hidden="true">
                        <Star colour={colour} icon={icon} ring={ring} size={Math.round(ring * 0.95)} lit={lit} delay={delay} still={still}/>
                    </svg>
                    {/* its number and name, small in the mono capitals, the name in its colour; its line beneath */}
                    <motion.span className="flex min-w-0 flex-col items-start text-left"
                                 initial={still ? false : { opacity: 0, x: -4 }} animate={lit ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                                 transition={lit ? { duration: 0.5, ease: "easeOut", delay: delay + 0.1 } : { duration: 0.15 }}>
                        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase leading-4 tracking-[0.14em] sm:text-[12px]">
                            <span className="tabular-nums text-ui-muted">{number}</span><span style={{ color: colour }}>{name}</span>
                        </span>
                        <span className="mt-1 text-[15px] leading-snug text-ui-muted sm:text-[16px]">{what}</span>
                    </motion.span>
                </>;
                const link = `pointer-events-auto flex w-full items-center gap-3 rounded-lg pr-2 text-left transition-transform hover:translate-x-0.5 focus-visible:outline focus-visible:outline-1 ${lit ? "" : "pointer-events-none"}`;
                return <li key={name} className="flex" style={{ height: row }}>
                    {name === "Play" ?
                        <button type="button" onClick={onPlay} aria-label="Play today’s chapter" tabIndex={lit ? 0 : -1} className={link}>{inside}</button> :
                        <Link href={href} aria-label={name} tabIndex={lit ? 0 : -1} className={link}>{inside}</Link>}
                </li>;
            })}
        </ol>
    </div>;
}

/** One canvas, kept, to measure the breadcrumb's versions */
let measurer: HTMLCanvasElement | null = null;

/**
 * Today's game's breadcrumb, in the guesses' row (empty on the landing, just under the clue), in the corners' quiet type:
 * while a chapter is hovered (a mouse or trackpad) or picked (a tap, or a click), where it sits, on one line ("Old
 * Testament / Wisdom / Book IV / Psalms 90"); otherwise nothing. Never cut short: where the line won't fit it slims,
 * first to "Old", then to the book's short name ("Ps 90"), then dropping the testament, then the division, and at the
 * least the chapter alone. A picked chapter's line goes to it on Read; picking it again lets it go
 */
function GuessLine({ active }: { active: boolean }) {
    const slot = useRef<HTMLDivElement>(null);
    const line = useRef<HTMLSpanElement>(null);
    const [room, setRoom] = useState(0);
    const [cell, setCell] = useState<GridmapCell | null>(null);
    const picked = useRef<GridmapCell | null>(null);
    const group = useRef<(cell: GridmapCell) => string | null>(() => null);

    // heard from whichever map the page has (withLiveMap follows it to a new one)
    useEffect(() => {
        const hovering = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        return withLiveMap((map) => {
            group.current = (c) => map.getModel().sections[c.sectionIndex]?.label || null;
            const stops = [map.on("selectCell", (c) => {
                const chosen = c as GridmapCell;
                // the picked chapter picked again: let go of it
                if (picked.current?.id === chosen.id) { picked.current = null; map.clearSelection(); setCell(null); return; }
                picked.current = chosen;
                setCell(chosen);
            })];
            // a mouse shows what it's over, falling back to what was picked
            if (hovering) stops.push(map.on("hoverCell", (c) => setCell((c as GridmapCell | null) ?? picked.current)));
            return () => stops.forEach(stop => stop());
        });
    }, []);
    // leaving the map sets it back to the whole (landing-overlay's reset), and the line with it
    useEffect(() => { if (!active) { picked.current = null; setCell(null); } }, [active]);

    // its room: the foot's row, less its padding (the slot itself only ever wraps what's in it, so it can't be measured)
    useLayoutEffect(() => {
        const row = slot.current?.parentElement;
        if (!row) return;
        const measure = () => {
            const style = getComputedStyle(row);
            setRoom(row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 16);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(row);
        return () => observer.disconnect();
    }, []);

    const versions: string[] = (() => {
        if (!cell) return [];
        const path = (parts: (string | null)[]) => parts.filter(Boolean).join(" / ");
        const g = group.current(cell);
        const chapter = `${cell.itemLabel} ${cell.label}`, short = `${abbreviation(cell.itemLabel)} ${cell.label}`;
        return [
            path([DivisionUtil.testament(cell.layerLabel), cell.groupLabel, g, chapter]),
            path([cell.layerLabel.replace(/ testament$/i, ""), cell.groupLabel, g, chapter]),
            path([cell.layerLabel.replace(/ testament$/i, ""), cell.groupLabel, g, short]),
            path([cell.groupLabel, g, short]),
            path([g, short]),
            short,
        ];
    })();
    const width = (text: string) => {
        const el = line.current ?? slot.current;
        if (!el) return 0;
        measurer ??= document.createElement("canvas");
        const ctx = measurer.getContext("2d")!;
        const style = getComputedStyle(el);
        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        // the line is set in capitals and spaced out, which the canvas doesn't do: both added here
        return ctx.measureText(text.toUpperCase()).width + text.length * (parseFloat(style.letterSpacing) || 0);
    };
    const text = cell ? versions.find(v => width(v) <= room) ?? versions[versions.length - 1] : null;
    // the picked chapter, to read: its page on Read, as the round's end links it (action.tsx)
    const reading = cell && cell === picked.current ? `/read/${cell.itemLabel.replace(/ /g, "")}${cell.label}` : null;
    // the old gives way at once and the new fades in: a swap that never waits on an exit animation to finish
    const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.22 } };

    return <div ref={slot} className="landing-corner flex min-w-0 justify-center" aria-live="polite">
        {text ?
            <motion.span key={`line-${text}`} ref={line} {...fade} className="whitespace-nowrap px-1">
                {reading ? <Link href={reading} aria-label={`Read ${cell!.itemLabel} ${cell!.label}`} className="pointer-events-auto hover:text-ui-text">{text}</Link> : text}
            </motion.span> : null}
    </div>;
}

/** The way in, as action.tsx's buttons: the bar's shape, then the lead's white or the follower's dark */
const BAR = "pointer-events-auto flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-[15px] font-semibold transition active:scale-[0.98]";
const LEAD = "border-transparent bg-play-text text-play-bg";
const FOLLOW = "border-play-line bg-play-surface text-play-text";

/** The hero's Play, as the Bible Game's home has it: wide, white, today's chapter */
const PlayButton = ({ onPlay }: { onPlay: () => void }) =>
    <button type="button" onClick={onPlay}
            className="group pointer-events-auto flex h-12 w-full max-w-[18rem] items-center justify-center gap-2 rounded-lg bg-play-text px-5 text-[16px] font-medium text-play-bg active:scale-[0.98]">
        Play today&apos;s chapter<ArrowRightIcon aria-hidden="true" className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2}/>
    </button>;

/** The Play page's places, by their hooks (data-play-part, app/play/[game]/game.tsx, summary.tsx), as the tutorial finds them */
const places = (page: Element) => ({
    header: page.querySelector("[data-play-part=header]"),
    clue: page.querySelector("[data-play-part=clue]"),
    guesses: page.querySelector("[data-play-part=guesses]"),
    map: page.querySelector("[data-play-part=map]"),
    bar: page.querySelector("[data-play-part=bar]"),
});
type Box = { x: number; y: number; width: number; height: number };
const boxOf = (el: Element | null): Box | null => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; };
const at = (b: Box) => ({ left: b.x, top: b.y, width: b.width, height: b.height });

/**
 * The landing, over the Play page with the page's own parts held back (its host sets data-landing). Its beats are CSS
 * snap points (the browser does the scrolling):
 * - the hero, as the Bible Game's home has it: the B, always turning to the cross and back, what the game is, Play
 *   today's chapter, and How it works at the foot
 * - the purpose: in the clue's place its heading and words; in the map's place the four steps down the page, each its
 *   star, number and name, and line, arriving one by one the first time (and simply there on a return)
 * - today's game: the map, at its size on Play, live to explore though nothing on it is played; today's clue in the
 *   clue's place under the question it asks; the chapter hovered or picked in the guesses' row; and the account's way
 *   in where Play keeps its buttons. Play hands over to the game around a map that doesn't move
 * The header is the app's own, as Play has it. `summary` is today's clue. Used by the webapp's home (home/home-host.tsx)
 */
export default function LandingOverlay({ onPlay, onSignUp, onLogIn, account, summary, info }: {
    onPlay: () => void; onSignUp: () => void; onLogIn: () => void; account: LandingAccount; summary?: string;
    info?: { firstname: string; lastname: string };
}) {
    const [page, setPage] = useState<Element | null>(null);
    const [boxes, setBoxes] = useState<Record<string, Box | null>>({});
    const [beat, setBeat] = useState(0);
    const stops = STOPS_DOWN;
    // where each stop rests, in pixels, measured from the snap points themselves
    const markers = useRef<(HTMLDivElement | null)[]>([]);
    // (a first guess from the viewport, until they're measured; none on the server, which has no viewport)
    const rests = useRef(STOPS_DOWN.map(s => typeof window === "undefined" ? 0 : window.innerHeight * s.rest / 100));

    // the page, once it's there
    useEffect(() => {
        const find = () => setPage(p => p && p.isConnected ? p : document.querySelector("[data-game-ready]"));
        find();
        const observer = new MutationObserver(find);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    // its places, again as the layout changes
    const measure = useCallback(() => {
        if (!page) return;
        const p = places(page);
        setBoxes({ header: boxOf(p.header), clue: boxOf(p.clue), guesses: boxOf(p.guesses), map: boxOf(p.map), bar: boxOf(p.bar) });
        if (markers.current.every(m => m)) rests.current = markers.current.map(m => m!.offsetTop);
    }, [page]);
    useLayoutEffect(measure, [measure]);
    useEffect(() => {
        if (!page) return;
        const observer = new ResizeObserver(measure);
        observer.observe(page);
        window.addEventListener("resize", measure);
        return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
    }, [page, measure]);

    // which stop the scroll is on: the nearest
    const { scrollY } = useScroll();
    const nearest = (y: number) => rests.current.reduce((best, r, i) => Math.abs(r - y) < Math.abs(rests.current[best] - y) ? i : best, 0);
    useMotionValueEvent(scrollY, "change", y => setBeat(nearest(y)));
    const kind = stops[Math.min(beat, stops.length - 1)].kind;
    const onClose = kind === "close";

    // the steps arrive one by one the first time the purpose is reached, and only then: come back to it and they're
    // simply there (told), as the story was left
    const [shown, setShown] = useState(0);
    const begun = useRef(false);
    const [told, setTold] = useState(false);
    const [landed, setLanded] = useState(false);
    useEffect(() => {
        if (kind !== "purpose" || begun.current) return;
        begun.current = true;
        STOPS.forEach((_, i) => window.setTimeout(() => setShown(i + 1), 350 + i * STEP_EVERY));
        // the way on, as the fourth step's words settle (its line drawn, then its star and words, ~1.1s), easing in
        // straight away (home-hero-cue-soon) rather than after the hero's long wait
        window.setTimeout(() => setLanded(true), 350 + (STOPS.length - 1) * STEP_EVERY + 800);
    }, [kind]);
    // once the purpose has been left with every step in, it's told: a return shows them still
    useEffect(() => { if (kind !== "purpose" && shown >= STOPS.length) setTold(true); }, [kind, shown]);

    // the map shows (landing.sass), and takes the pointer, on today's game; once out of sight it's set back to the whole
    // map, so coming back finds it fresh rather than where the visitor left it
    useEffect(() => {
        if (!page) return;
        page.toggleAttribute("data-map-shown", onClose);
        if (!onClose) {
            const map = liveMap();
            map?.clearSelection();
            map?.focusMap();
        }
        return () => page.removeAttribute("data-map-shown");
    }, [page, onClose]);
    // on, to the next stop
    const next = () => { if (beat + 1 < stops.length) window.scrollTo({ top: rests.current[beat + 1], behavior: "smooth" }); };

    // the beats are the page's resting places; a visit always opens on the first, never where a reload left the page
    useEffect(() => {
        const html = document.documentElement, was = history.scrollRestoration;
        html.style.scrollSnapType = "y mandatory";
        history.scrollRestoration = "manual";
        window.scrollTo(0, 0);
        return () => { html.style.scrollSnapType = ""; history.scrollRestoration = was; };
    }, []);

    const { header, clue, guesses, map, bar } = boxes;
    // each resting place holds (scroll-snap-stop), so a quick swipe can't pass a step by. The landing takes no pointer
    // itself, so the map beneath is live on today's game. It sits over the Play page (its parts reach z-30) but under the
    // app's sheets and the menu drawer (HeroUI's portals, z-50)
    return <div className="pointer-events-none relative z-[40]" style={{ height: `calc(100svh + ${stops[stops.length - 1].rest}svh)` }}>
        {stops.map((s, i) => <div key={i} ref={el => { markers.current[i] = el; }} aria-hidden="true" className="pointer-events-none absolute inset-x-0 h-px"
                                  style={{ top: `${s.rest}svh`, scrollSnapAlign: "start", scrollSnapStop: "always" }}/>)}

        {/* for screen readers, the whole story as text: the places below change as the scroll moves */}
        <div className="sr-only">
            <h1>Explore the Bible with a daily passage-guessing game</h1>
            <h2>{FLOW_HEADING}: {FLOW_WORDS}</h2>
            <ol>{STOPS.map(s => <li key={s.name}>{s.number} {s.name}: {s.what}</li>)}</ol>
            <h2>{CLOSE_WORDS}</h2>
            {summary ? <p>Today’s clue: {summary}</p> : null}
        </div>

        <div className="pointer-events-none fixed inset-0">
            {/* the header's place: the app's own header, as Play has it */}
            {header ? <div className="pointer-events-auto absolute" style={at(header)}>
                <AppHeader info={info}/>
            </div> : null}

            {/* the hero, as the Bible Game's home has it: the emblem, what the game is, Play, and How it works */}
            <AnimatePresence>
                {kind === "hero" ? <motion.div key="hero" className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-4 pb-24 text-center"
                                               exit={{ opacity: 0, transition: { duration: 0.25 } }}>
                    <GlowingCross height={170}/>
                    <p className="home-hero-text home-tagline">Explore the Bible <em>with a daily passage-guessing game</em></p>
                    <div className="home-hero-actions"><PlayButton onPlay={onPlay}/></div>
                </motion.div> : null}
            </AnimatePresence>

            {/* the clue's place: the purpose, its heading and its words, as the purpose screen's own head; on today's game,
                the question and today's clue */}
            {clue ? <div className="absolute flex items-center justify-center px-6 pb-4 pt-1" style={at(clue)}>
                <AnimatePresence mode="wait">
                    {kind === "purpose" ? <motion.div key="purpose" className="flex flex-col items-center"
                                                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                        <p className="mb-1.5 font-mono text-[11px] uppercase leading-4 tracking-[0.14em] text-ui-muted">{FLOW_HEADING}</p>
                        <p className={CLUE}>{FLOW_WORDS}</p>
                    </motion.div> : onClose ? <motion.div key="close" className="flex flex-col items-center"
                                                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                        <p className="mb-1.5 font-mono text-[11px] uppercase leading-4 tracking-[0.14em] text-ui-muted">{CLOSE_WORDS}</p>
                        <p className={CLUE}>{summary}</p>
                    </motion.div> : null}
                </AnimatePresence>
            </div> : null}

            {/* the map's place, on the purpose: the four steps down the page, arriving one by one the first time, and simply
                there after */}
            {/* (from beneath the purpose's words to the top of the foot, the guesses' row and the map's place together) */}
            {map && clue && bar ? <div className="absolute flex items-center justify-center px-6"
                                        style={{ left: map.x, width: map.width, top: clue.y + clue.height, height: bar.y - (clue.y + clue.height) }}>
                <AnimatePresence>
                    {kind === "purpose" ? <motion.div key="steps" className="w-full"
                                                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                        <Steps shown={told ? STOPS.length : shown} room={bar.y - (clue.y + clue.height)} still={told} onPlay={onPlay}/>
                    </motion.div> : null}
                </AnimatePresence>
            </div> : null}

            {/* the guesses' row, on today's game: the chapter hovered or picked */}
            {guesses ? <div className="absolute flex items-center justify-center px-4" style={at(guesses)}>
                {onClose ? <GuessLine active={onClose}/> : null}
            </div> : null}

            {/* the way on, at the foot, bobbing as the home's does: How it works from the hero; from the purpose, the chevron
                alone, on to today's game */}
            {/* (on the purpose, only once its fourth step has fully come in) */}
            {!onClose && (kind === "hero" || told || landed) ? <div className="absolute inset-x-0 bottom-0 flex justify-center">
                <button type="button" onClick={next} aria-label={kind === "hero" ? undefined : "Next"} className={`home-hero-cue pointer-events-auto${kind === "hero" ? "" : " home-hero-cue-soon"}`}>
                    <AnimatePresence mode="wait" initial={false}>
                        {kind === "hero" ? <motion.span key="how" exit={{ opacity: 0 }}>How it works</motion.span> : null}
                    </AnimatePresence>
                    <ChevronDownIcon className="size-5" aria-hidden="true"/>
                </button>
            </div> : null}

            {/* the way in, on today's game, where Play keeps its round-end buttons (Copy Result and Read, action.tsx): two
                side by side, the account's on the left and Play on the right: for a visitor we don't know, Sign up beside
                Play, the lead; for one whose account we know, Log in, the lead (it signs them in and takes them on into
                today's game), beside Play; for a member, logged in, Play alone. Their foot sits 10px above the bar's */}
            {bar ? <div className="absolute flex h-12 items-center px-4"
                        style={{ left: bar.x, width: bar.width, top: bar.y + bar.height - 58 }}>
                <AnimatePresence>
                    {onClose ? <motion.div key="way-in" className="grid w-full grid-cols-2 gap-2"
                                           initial={{ opacity: 0, y: 6, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                           exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                           transition={{ type: "spring", stiffness: 420, damping: 28, delay: 0.15 }}>
                        {account === "member" ?
                            <button type="button" onClick={onPlay} className={`group col-span-2 ${BAR} ${LEAD}`}>
                                Play<ArrowRightIcon aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25}/>
                            </button> : account === "known" ? <>
                            <button type="button" onClick={onLogIn} className={`${BAR} ${LEAD}`}>
                                <UserRoundIcon className="size-4 shrink-0" strokeWidth={2.25} aria-hidden="true"/>Log in
                            </button>
                            <button type="button" onClick={onPlay} className={`group ${BAR} ${FOLLOW}`}>
                                Play<ArrowRightIcon aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25}/>
                            </button>
                        </> : <>
                            <button type="button" onClick={onSignUp} className={`${BAR} ${FOLLOW}`}>
                                <UserRoundPlusIcon className="size-4 shrink-0" strokeWidth={2.25} aria-hidden="true"/>Sign up
                            </button>
                            <button type="button" onClick={onPlay} className={`group ${BAR} ${LEAD}`}>
                                Play<ArrowRightIcon aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25}/>
                            </button>
                        </>}
                    </motion.div> : null}
                </AnimatePresence>
            </div> : null}
        </div>
    </div>;
}
