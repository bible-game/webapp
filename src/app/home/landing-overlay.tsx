"use client"

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRightIcon, BookOpenIcon, ChartColumnIcon, ChevronDownIcon, LightbulbIcon, PlayIcon, UserRoundIcon, UserRoundPlusIcon } from "lucide-react";
import GlowingCross from "@/app/home/glowing-cross";
import AppHeader from "@/core/component/app-header";
import { playTheme } from "@/core/style/play-theme";
import "@/app/home/landing.sass";

/**
 * The beats, a resting place each: the hero, as the Bible Game's home has it; the daily flow, a beat for each of its
 * four steps; then today's game, the map come in, to play
 */
const FLOW = 4;
const BEATS = ["hero", ...Array.from({ length: FLOW }, () => "flow"), "close"] as const;
const LAST = BEATS.length - 1;
/**
 * Where each beat rests, down the scroll (svh): a longer scroll into the steps and out of them to today's game, so each
 * change of screen is a deliberate move, and a steady one from star to star
 */
const REST = [0, 100, 180, 260, 340, 440];

/** The flow's words, set as a clue is in the clue's place, under a quiet heading */
const FLOW_HEADING = "Purpose";
const FLOW_WORDS = "Explore the human story";

/**
 * Who the visitor is to us, for the close's buttons: a guest we don't know (Sign up beside Play), one whose account we
 * know, logged in on this device before (Play beside Log in), or a member, logged in now (Play alone)
 */
export type LandingAccount = "guest" | "known" | "member";

/** The close: today's own clue, in the clue's place over the map, under the question it asks as its heading */
const CLOSE_WORDS = "Can you find today’s chapter?";
/** The clue's own type (summary.tsx) */
const CLUE = "font-mono text-[18px] font-normal leading-[1.45] tracking-normal text-play-text text-center text-balance";


/** The tile entrance, as guess.tsx's Tile comes in, after `delay` seconds */
const rise = (delay = 0.25) => ({ initial: { opacity: 0, y: 6, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, transition: { duration: 0.15 } },
    transition: { type: "spring" as const, stiffness: 420, damping: 28, delay } });
const tile = { type: "spring" as const, stiffness: 420, damping: 28 };

/**
 * The four steps, in the order a day takes them, as a line of stars down the page, joined by a hairline that runs from
 * one step's colour into the next's (the B's runs, cool to warm, as the hero's stones go). Each star is the step's own
 * menu icon (app-header.tsx) in a small lit circle of its colour; beside it its number and name, small in the mono
 * capitals, the name in its colour, and beneath a muted line on what it's for
 */
const STOPS = [
    { number: "01", name: "Play", what: "Visualise the Bible", icon: PlayIcon, colour: playTheme.teal },
    { number: "02", name: "Read", what: "Digest today’s chapter", icon: BookOpenIcon, colour: playTheme.purple },
    { number: "03", name: "Study", what: "Stretch your understanding", icon: LightbulbIcon, colour: playTheme.rose },
    { number: "04", name: "Stats", what: "Track your progress", icon: ChartColumnIcon, colour: playTheme.gold },
];
/** How long the line to a step takes to draw, and so how long the step waits to light (s) */
const LINE_FOR = 0.6;
/** A colour at an opacity, from its hex */
const tint = (hex: string, a: number) => `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;

/**
 * The steps' measures, from the room they have (the map's place): spaced to fill its height, the circles and words
 * sized in proportion, the words held to a size whose longest line still fits the width
 */
const measures = (width: number, room: number) => {
    const row = Math.min(132, Math.max(84, room * 0.27));
    const ring = Math.min(30, Math.max(19, row * 0.22));
    const label = ring + 16;
    const detail = Math.max(13, Math.min(18, row * 0.14, (width - ring - label - 8) / 13.5));
    return { row, ring, label, icon: Math.round(ring * 0.95), mono: Math.max(11, Math.round(detail * 0.72)), detail };
};

/**
 * A step's star. Nothing until the scroll reaches it; then it lights: a circle of its colour, tinted within, its edge drawn finely, in a soft halo, and in it the step's icon
 * in the colour, as the menu draws it
 */
function Star({ colour, icon: Icon, ring, size, lit, delay }: { colour: string; icon: typeof PlayIcon; ring: number; size: number; lit: boolean; delay: number }) {
    const ease = { duration: 0.5, ease: [0.22, 0.8, 0.24, 1] as const, delay: lit ? delay : 0 };
    return <g>
        <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={lit ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }} transition={ease}>
            <circle r={ring * 1.22} fill={tint(colour, 0.07)}/>
            <circle r={ring} fill={tint(colour, 0.12)} stroke={tint(colour, 0.55)} strokeWidth={1}/>
            <Icon x={-size / 2} y={-size / 2} width={size} height={size} color={colour} strokeWidth={1.5}/>
        </motion.g>
    </g>;
}

/**
 * The steps, as far as the scroll has come: `shown` of them (1 to 4). One upright line of stars, the stars and their
 * words centred together in the width; each step of the scroll draws the line on to the next, then that star lights
 * and its words arrive beside it. Scrolling back puts them out again
 */
function Steps({ shown, room }: { shown: number; room: number }) {
    const box = useRef<HTMLDivElement>(null);
    const labels = useRef<(HTMLDivElement | null)[]>([]);
    const [width, setWidth] = useState(0);
    const [label, setLabel] = useState(0);
    useLayoutEffect(() => {
        const element = box.current;
        if (!element) return;
        const measure = () => {
            setWidth(element.clientWidth);
            setLabel(Math.max(0, ...labels.current.map(l => l?.offsetWidth ?? 0)));
        };
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        measure();
        document.fonts?.ready.then(measure);
        return () => observer.disconnect();
    }, []);
    const m = measures(width, room);
    const x = Math.max(m.ring + 2, (width - m.ring - m.label - label) / 2 + m.ring);
    const y = (i: number) => m.ring * 1.3 + i * m.row;
    const height = y(STOPS.length - 1) + m.ring * 1.3;

    return <div ref={box} className="relative mx-auto w-full max-w-[30rem]" style={{ height }}>
        <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden="true">
            <defs>
                {STOPS.slice(1).map((to, i) => <linearGradient key={i} id={`steps-${i}`} gradientUnits="userSpaceOnUse" x1={x} y1={y(i)} x2={x} y2={y(i + 1)}>
                    <stop offset="0" stopColor={STOPS[i].colour}/><stop offset="1" stopColor={to.colour}/>
                </linearGradient>)}
            </defs>
            {STOPS.slice(1).map((_, i) => {
                const drawn = i + 1 < shown, gap = m.ring * 1.22 + 4;
                return <motion.line key={i} x1={x} y1={y(i) + gap} x2={x} y2={y(i + 1) - gap} stroke={`url(#steps-${i})`} strokeWidth={1}
                                    initial={{ pathLength: 0, opacity: 0 }} animate={drawn ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
                                    transition={{ duration: drawn ? LINE_FOR : 0.15, ease: [0.45, 0, 0.25, 1] }}/>;
            })}
            {STOPS.map((stop, i) => <g key={stop.name} transform={`translate(${x} ${y(i)})`}>
                <Star colour={stop.colour} icon={stop.icon} ring={m.ring} size={m.icon} lit={i < shown} delay={i === 0 ? 0.15 : LINE_FOR * 0.85}/>
            </g>)}
        </svg>
        {STOPS.map(({ number, name, what }, i) => {
            const lit = i < shown;
            return <motion.div key={name} ref={el => { labels.current[i] = el; }} className="absolute flex flex-col whitespace-nowrap"
                               style={{ left: x + m.label, top: y(i) - (m.mono * 1.4 + 4 + m.detail * 1.3) / 2 }}
                               initial={{ opacity: 0, x: -4 }} animate={lit ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                               transition={lit ? { duration: 0.5, ease: "easeOut", delay: (i === 0 ? 0.15 : LINE_FOR * 0.85) + 0.1 } : { duration: 0.15 }}>
                {/* its number and name, small in the mono capitals, the name in its colour */}
                <span className="flex items-center gap-1.5 font-mono uppercase tracking-[0.16em]" style={{ fontSize: m.mono, lineHeight: 1.4 }}>
                    <span className="tabular-nums text-ui-muted">{number}</span><span style={{ color: STOPS[i].colour }}>{name}</span>
                </span>
                <span className="mt-1 text-ui-muted" style={{ fontSize: m.detail, lineHeight: 1.3 }}>{what}</span>
            </motion.div>;
        })}
    </div>;
}

/** The two buttons at the close, as action.tsx's: the bar's shape, then the lead's white or the follower's dark */
const BAR = "pointer-events-auto flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-[15px] font-semibold transition active:scale-[0.98]";
const LEAD = "border-transparent bg-play-text text-play-bg";
const FOLLOW = "border-play-line bg-play-surface text-play-text";

const PlayButton = ({ onPlay, className = "" }: { onPlay: () => void; className?: string }) =>
    <button type="button" onClick={onPlay}
            className={`group pointer-events-auto flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-play-text px-5 text-[16px] font-medium text-play-bg active:scale-[0.98] ${className}`}>
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
 * The landing, over the Play page with the page's own parts held back (its host sets data-landing). Six beats, each a
 * CSS snap point (the browser does the scrolling):
 * - the hero, as the Bible Game's home has it: the B, always turning to the cross and back, the tagline, Play today's
 *   chapter (white), and How it works at the foot
 * - Purpose, a beat a step: in the clue's place its heading and words, in the map's place the steps, one more each beat
 * - today's game: the map comes in, today's clue in the clue's place under the question it asks, and the account's
 *   buttons in the guess bar's place; Play dissolves the landing into the game, the tutorial on a first visit or the round
 * The header holds the menu throughout (the app's own, AppHeader). `summary` is today's clue; `onSignUp` and `onLogIn` go to the
 * account pages (the wizard mocks them). Used by the webapp's home (home/home-host.tsx) and the wizard's (onboarding.tsx)
 */
export default function LandingOverlay({ onPlay, onSignUp, onLogIn, account, summary, info }: {
    onPlay: () => void; onSignUp: () => void; onLogIn: () => void; account: LandingAccount; summary?: string;
    info?: { firstname: string; lastname: string };
}) {
    const [page, setPage] = useState<Element | null>(null);
    const [boxes, setBoxes] = useState<Record<string, Box | null>>({});
    const [beat, setBeat] = useState(0);
    // where each beat rests, in pixels, measured from the snap points themselves
    const markers = useRef<(HTMLDivElement | null)[]>([]);
    // (a first guess from the viewport, until they're measured; none on the server, which has no viewport)
    const rests = useRef(REST.map(r => typeof window === "undefined" ? 0 : window.innerHeight * r / 100));

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

    // which beat the scroll is on; the map is held back (landing.sass) until the last, today's game
    const { scrollY } = useScroll();
    // the beat is the resting place nearest the scroll
    const nearest = (y: number) => rests.current.reduce((best, r, i) => Math.abs(r - y) < Math.abs(rests.current[best] - y) ? i : best, 0);
    useMotionValueEvent(scrollY, "change", y => setBeat(nearest(y)));
    useEffect(() => {
        if (!page) return;
        page.toggleAttribute("data-map-shown", beat === LAST);
        return () => page.removeAttribute("data-map-shown");
    }, [page, beat]);
    const next = () => window.scrollTo({ top: rests.current[Math.min(LAST, beat + 1)], behavior: "smooth" });

    // the beats are the page's resting places; a visit always opens on the first, never where a reload left the page
    useEffect(() => {
        const html = document.documentElement, was = history.scrollRestoration;
        html.style.scrollSnapType = "y mandatory";
        history.scrollRestoration = "manual";
        window.scrollTo(0, 0);
        return () => { html.style.scrollSnapType = ""; history.scrollRestoration = was; };
    }, []);

    const kind = BEATS[beat];
    const { header, clue, guesses, map, bar } = boxes;

    // each resting place holds (scroll-snap-stop), so a quick swipe can't pass a star by
    return <div className="relative z-[65]" style={{ height: `calc(100svh + ${REST[LAST]}svh)` }}>
        {REST.map((rest, i) => <div key={i} ref={el => { markers.current[i] = el; }} aria-hidden="true" className="pointer-events-none absolute inset-x-0 h-px"
                                    style={{ top: `${rest}svh`, scrollSnapAlign: "start", scrollSnapStop: "always" }}/>)}

        {/* for screen readers, the whole story as text: the places below change as the scroll moves */}
        <div className="sr-only">
            <h1>Explore the Bible with a daily passage-guessing game</h1>
            <h2>{FLOW_HEADING}: {FLOW_WORDS}</h2>
            <ol>{STOPS.map(s => <li key={s.name}>{s.number} {s.name}: {s.what}</li>)}</ol>
            <h2>{CLOSE_WORDS}</h2>
            {summary ? <p>Today’s clue: {summary}</p> : null}
        </div>

        <div className="pointer-events-none fixed inset-0">
            {/* the header's place: the menu (the app's own, with nothing on the right) */}
            {header ? <div className="pointer-events-auto absolute" style={at(header)}>
                <AppHeader info={info} aside={null}/>
            </div> : null}

            {/* the hero, as the Bible Game's home (app/landing.tsx): the emblem, the tagline, Play, and How it works */}
            <AnimatePresence>
                {kind === "hero" ? <motion.div key="hero" aria-hidden="true" exit={{ opacity: 0, transition: { duration: 0.25 } }}
                                               className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-4 pb-24 text-center">
                    <GlowingCross height={170}/>
                    <p className="home-hero-text home-tagline">Explore the Bible <em>with a daily passage-guessing game</em></p>
                    <div className="home-hero-actions"><PlayButton onPlay={onPlay} className="max-w-[18rem]"/></div>
                </motion.div> : null}
            </AnimatePresence>

            {/* the clue's place: the flow's heading, or the close's words set as the clue is, arriving letter by letter */}
            {clue ? <div aria-hidden="true" className="absolute flex items-center justify-center px-6 pb-4 pt-1" style={at(clue)}>
                <AnimatePresence mode="wait">
                    {kind === "flow" ? <motion.div key="flow" exit={{ opacity: 0, transition: { duration: 0.15 } }} className="flex flex-col items-center">
                        <p className="mb-1.5 font-mono text-[11px] uppercase leading-4 tracking-[0.14em] text-ui-muted">{FLOW_HEADING}</p>
                        <p className={`landing-words ${CLUE}`}>{FLOW_WORDS}</p>
                    </motion.div> : kind === "close" ? <motion.div key="close" exit={{ opacity: 0, transition: { duration: 0.15 } }} className="flex flex-col items-center">
                        <p className="mb-1.5 font-mono text-[11px] uppercase leading-4 tracking-[0.14em] text-ui-muted">{CLOSE_WORDS}</p>
                        <p className={`landing-words ${CLUE}`}>{summary}</p>
                    </motion.div> : null}
                </AnimatePresence>
            </div> : null}

            {/* the map's place, through the flow: the route, a stop more each beat */}
            {/* the figure fills the map's place, centred in it */}
            {map ? <div className="absolute flex items-center justify-center px-4" style={at(map)}>
                <AnimatePresence>
                    {kind === "flow" ? <motion.div key="flow" className="w-full" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                        <Steps shown={beat} room={map.height}/>
                    </motion.div> : null}
                </AnimatePresence>
            </div> : null}

            {/* How it works, at the foot from the hero through the flow, bobbing as the home's does, to take the next step */}
            {/* the way on, at the foot, bobbing as the home's does: How it works from the hero; through the steps, only the
                chevron, until they're all in and what follows is the game itself, to see in action */}
            {kind !== "close" ? <div className="absolute inset-x-0 bottom-0 flex justify-center">
                <button type="button" onClick={next} aria-label={kind === "hero" ? undefined : "Next"} className="home-hero-cue pointer-events-auto">
                    <AnimatePresence mode="wait" initial={false}>
                        {kind === "hero" ? <motion.span key="how" exit={{ opacity: 0 }}>How it works</motion.span>
                            : beat === LAST - 1 ? <motion.span key="see" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>See it in action</motion.span>
                            : null}
                    </AnimatePresence>
                    <ChevronDownIcon className="size-5" aria-hidden="true"/>
                </button>
            </div> : null}

            {/* the guess bar's place, at the close: two buttons side by side, as the round's end has Copy and Read (action.tsx):
                for a visitor we don't know, Sign up beside Play, the lead; for one whose account we know, Play beside Log in, the
                lead, which signs them in and takes them on into today's game; for a member, logged in, Play alone */}
            {bar ? <div className="absolute flex items-center px-4" style={at(bar)}>
                <AnimatePresence>
                    {kind === "close" ? <motion.div key="play" {...rise(0.15)} className="grid w-full grid-cols-2 gap-2">
                        {account === "member" ?
                            <button type="button" onClick={onPlay} className={`group col-span-2 ${BAR} ${LEAD}`}>
                                Play<ArrowRightIcon aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25}/>
                            </button> : account === "known" ? <>
                            <button type="button" onClick={onPlay} className={`${BAR} ${FOLLOW}`}>
                                Play<ArrowRightIcon aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.25}/>
                            </button>
                            <button type="button" onClick={onLogIn} className={`${BAR} ${LEAD}`}>
                                <UserRoundIcon className="size-4 shrink-0" strokeWidth={2.25} aria-hidden="true"/>Log in
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
