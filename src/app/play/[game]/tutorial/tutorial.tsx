"use client"

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import { cameraOf, glideTo, liveMap } from "@/app/play/[game]/tutorial/map-handle";
import "@/app/play/[game]/tutorial/tutorial.sass";

/**
 * A step of the tutorial: what it says (in the clue's place), its Next (in the guess button's place), and whether a
 * guess is made for the visitor to watch. tutorial.sass brings the page in a part a step
 */
type Step = { id: string; text: string; next: string; demo?: boolean };
const STEPS: Step[] = [
    { id: "clue", text: "Each day a chapter is summarised", next: "Next" },
    { id: "map", text: "Every square is a chapter of the Bible", next: "Next" },
    { id: "guesses", text: "You have 5 guesses, each pointing you closer", next: "Play", demo: true },
];
/** What the clue's place says once the guesses have all landed: the hand-over, as the real clue takes its place on Play */
const YOUR_TURN = "Now it’s your turn!";

/**
 * The guesses made for the visitor to watch, narrowing in as a round does: one in the right testament but far off (red,
 * and the New Testament greys out), one in the right division (yellow, and the map closes in on Wisdom), one in the
 * right book (green, and the map closes in on Psalms), then the answer itself (found: the round ends, with its stars,
 * and the map eases back out to show the answer on the whole map, where Play would jump). Each: the map glides in where
 * there's somewhere to go, picks the chapter (big enough by then to read), then guesses it
 */
const DEMO: { cell: string; label: string; glide?: { group: string } | { item: string }; found?: boolean }[] = [
    { cell: "JOS/1", label: "Guess Joshua 1" },
    { cell: "PRO/10", label: "Guess Proverbs 10", glide: { group: "wisdom" } },
    { cell: "PSA/121", label: "Guess Psalms 121", glide: { item: "PSA" } },
    { cell: "PSA/127", label: "Guess Psalms 127", found: true },
];
/** Into the guesses step (ms): when the first begins, then each guess's glide, pick and guess, and the gap to the next */
const GLIDE_FOR = 940, PICK_AFTER = 1075, GUESS_AFTER = 875, NEXT_AFTER = 805;
/** When the first guess begins: as the step's words are three-quarters in (the old words' going, their entrance's lead,
 * three-quarters of its sweep), so the map starts moving as you finish reading rather than after */
const START = 350 + 350 + 2400 * 0.75;

/** The clue's sizes, as the Play page's (app/play/[game]/summary.tsx): the largest that keeps the words to two lines */
const SIZES = [18, 17, 16, 15];

/** Set once the tutorial has been seen (finished or skipped), so a returning visitor goes straight to the game */
const SEEN = "tutorial-seen";
export const tutorialSeen = () => { try { return localStorage.getItem(SEEN) === "1"; } catch { return false; } };
const remember = () => { try { localStorage.setItem(SEEN, "1"); } catch { /* it just shows again */ } };

/** The Play page's parts, by their hooks (data-play-part in game.tsx, summary.tsx) */
const part = (page: Element, name: string) => page.querySelector(`[data-play-part=${name}]`);

type Box = { x: number; y: number; width: number; height: number };
const boxOf = (el: Element | null | undefined): Box | null => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; };

/** The entrance's timing (ms), as tutorial.sass has it: the wait before the clue's shimmer, the shimmer's sweep, and
 * how long a tile-style rise takes (the zoom note's, then the guess bar's, after the clue) */
export const ENTRANCE = { lead: 350, sweep: 2400, rise: 450 };
/** How long a line takes to arrive, from its mounting to the light's leaving it */
export const SHIMMER = ENTRANCE.lead + ENTRANCE.sweep;

/**
 * Words in the clue's own type, at the largest of its sizes that keeps them to two lines, arriving with the entrance
 * (tutorial.sass); `onLit` once they're in (straight away under reduced motion, where there's none)
 */
function Words({ text, onLit }: { text: string; onLit: () => void }) {
    useEffect(() => {
        const timer = window.setTimeout(onLit, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : SHIMMER);
        return () => clearTimeout(timer);
    }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
    const p = useRef<HTMLParagraphElement>(null);
    const [size, setSize] = useState(SIZES[0]);
    useLayoutEffect(() => {
        const el = p.current;
        if (!el) return;
        for (const s of SIZES) {
            el.style.fontSize = `${s}px`;
            if (el.scrollHeight <= s * 1.45 * 2 + 1) { setSize(s); return; }
        }
        setSize(SIZES[SIZES.length - 1]);
    }, [text]);
    return <p ref={p} className="clue-shimmer font-mono font-normal leading-[1.45] text-play-text text-center text-balance" style={{ fontSize: size }}>{text}</p>;
}

/** A stage of the progress: an empty ring to come, a gold ring for now, and, once done, filled with a tick drawn in */
function Stage({ state }: { state: "done" | "now" | "next" }) {
    return <span className={`relative flex size-[18px] items-center justify-center rounded-full border-[1.5px] transition-colors duration-300 ${state === "done" ? "border-ui-success bg-ui-success" : state === "now" ? "border-play-gold" : "border-ui-line"}`}>
        {state === "now" ? <motion.span layoutId="tutorial-now" className="size-2 rounded-full bg-play-gold"/> : null}
        {state === "done" ? <svg viewBox="0 0 18 18" className="absolute inset-0 size-full" aria-hidden="true">
            <motion.path d="M5.2 9.4 7.8 12 12.8 6.6" fill="none" stroke="var(--ui-bg)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                         initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}/>
        </svg> : null}
    </span>;
}

/**
 * The first-visit tutorial, made of the genuine Play page rather than laid over it. `onStage` tells the page's wrapper
 * how much of the page to show (tutorial.sass): the words alone, in the clue's place and type, with Next in the guess
 * button's place and style; then the map; then the guesses, where, once the words have had their shimmer, guesses are
 * made for the visitor to watch: the page's own, on its own map, four, narrowing in (testament, division, book) to the
 * answer, each gliding in, picking and guessing, so the tiles land and the map closes in as they would. Next waits for
 * each step's shimmer, and for the guesses. The progress (a circle a stage) and Skip take the header's place; once every
 * stage is done, Skip becomes Restart. At the end (or on Skip, or Escape) the page's parts come back, and `onDone` says
 * whether guesses were made to watch; `onReset`, on Restart, sets the round back to empty once they were. It waits for
 * the page's own first-visit sheet (the cookie notice)
 */
export default function Tutorial({ onStage, onReset, onDone }: { onStage: (stage: number) => void; onReset: () => void; onDone: (demoed: boolean) => void }) {
    const root = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState<Element | null>(null);
    const [at, setAt] = useState(0);
    const [boxes, setBoxes] = useState<{ header: Box | null; clue: Box | null; bar: Box | null }>({ header: null, clue: null, bar: null });
    const demoed = useRef(false);
    const step = STEPS[at];
    // whether this step's words have had their shimmer
    const [lit, setLit] = useState(false);
    useEffect(() => setLit(false), [at]);
    // whether the guesses to watch have all landed: then the last stage is done, and Skip becomes Restart
    const [shown, setShown] = useState(false);
    // Next waits for the shimmer, and on the guesses step for the guesses too, with a spinner the whole while
    const watching = !!step.demo && !shown;
    const waiting = !lit || watching;
    // the words in the clue's place: the step's, then, once the guesses have all landed, the hand-over, which Play
    // waits for as it waits for any words
    const words = step.demo && shown ? YOUR_TURN : step.text;
    useEffect(() => { if (shown) setLit(false); }, [shown]);

    // the page is ready once the game has rendered and no sheet of its own (the cookie notice) is up; it's looked for
    // again after a Restart, which makes the page afresh
    const find = useCallback(() => {
        const game = document.querySelector("[data-game-ready]");
        if (game && !document.querySelector("[role=dialog][aria-modal=true]")) setPage(p => p && p.isConnected ? p : game);
    }, []);
    useEffect(() => {
        find();
        const observer = new MutationObserver(find);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [find]);

    useEffect(() => onStage(at), [at, onStage]);

    // where the progress, the words and Next go: the header's, the clue's and the guess bar's places
    const measure = useCallback(() => {
        if (!page) return;
        setBoxes({ header: boxOf(part(page, "header")), clue: boxOf(part(page, "clue")), bar: boxOf(part(page, "bar")) });
    }, [page]);
    useLayoutEffect(measure, [measure]);
    useEffect(() => {
        if (!page) return;
        const observer = new ResizeObserver(measure);
        observer.observe(page);
        return () => observer.disconnect();
    }, [page, measure]);

    // the guesses to watch: for each, the map glides in, picks the chapter as a tap would, then the page's own Guess takes it
    useEffect(() => {
        if (!page || !step.demo || demoed.current) return;
        let cancel = () => {}, t = START;
        const timers: number[] = [];
        const at = (ms: number, run: () => void) => timers.push(window.setTimeout(run, ms));
        DEMO.forEach(({ cell, label, glide, found }) => {
            if (glide) { at(t, () => { const map = liveMap(); if (map) cancel = glideTo(map, glide, GLIDE_FOR); }); t += PICK_AFTER; }
            at(t, () => { liveMap()?.selectCell(cell); });
            t += GUESS_AFTER;
            at(t, () => {
                const button = page.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
                if (!button) return;
                const map = liveMap(), was = map && cameraOf(map);
                demoed.current = true;
                button.click();
                // the round's over: Play jumps out to the whole map; ease out from where it was instead
                if (found && was) window.setTimeout(() => { const now = liveMap(); if (now) cancel = glideTo(now, { whole: true }, GLIDE_FOR, was); }, 40);
            });
            t += NEXT_AFTER + (found ? GLIDE_FOR : 0);
        });
        at(t - NEXT_AFTER / 2, () => setShown(true));
        return () => { timers.forEach(clearTimeout); cancel(); };
    }, [page, step]);

    const finish = useCallback(() => { remember(); onDone(demoed.current); }, [onDone]);
    const restart = useCallback(() => { if (demoed.current) onReset(); demoed.current = false; setShown(false); setAt(0); }, [onReset]);
    const advance = useCallback(() => {
        if (waiting) return;
        if (at >= STEPS.length - 1) finish(); else setAt(a => Math.min(a + 1, STEPS.length - 1));
    }, [at, waiting, finish]);
    useEffect(() => {
        if (!page) return;
        const key = (e: KeyboardEvent) => {
            if (e.key === "Escape") finish();
            else if (e.key === "ArrowRight" || e.key === "Enter") advance();
        };
        window.addEventListener("keydown", key);
        root.current?.focus({ preventScroll: true });
        return () => window.removeEventListener("keydown", key);
    }, [page, advance, finish]);

    if (!page) return null;
    const place = (b: Box) => ({ left: b.x, top: b.y, width: b.width, height: b.height });
    const link = "group flex h-11 shrink-0 items-center gap-1 px-2 text-[14px] text-ui-muted transition-colors hover:text-ui-text";

    return <div ref={root} tabIndex={-1} role="region" aria-label="How to play" className="pointer-events-none fixed inset-0 z-[65] outline-none">
        {/* the progress, a circle a stage, and Skip (Restart, once every stage is done), in the header's place */}
        {boxes.header ? <div className="pointer-events-auto absolute flex items-center justify-between pl-4 pr-2" style={place(boxes.header)}>
            <ol aria-label={`Step ${at + 1} of ${STEPS.length}`} className="flex items-center gap-2">
                {STEPS.map((s, i) => <li key={s.id} aria-hidden="true"><Stage state={i < at || (i === at && shown) ? "done" : i === at ? "now" : "next"}/></li>)}
            </ol>
            {shown ?
                <button type="button" onClick={restart} className={link}><RotateCcwIcon aria-hidden="true" className="size-[14px] transition-transform group-hover:-rotate-45" strokeWidth={2}/>Restart</button> :
                <button type="button" onClick={finish} className={link}>Skip<ArrowRightIcon aria-hidden="true" className="size-[15px] transition-transform group-hover:translate-x-0.5" strokeWidth={2}/></button>}
        </div> : null}

        {/* the words, in the clue's place and type */}
        {boxes.clue ? <div aria-live="polite" className="absolute flex items-center justify-center px-6 pb-4 pt-1" style={place(boxes.clue)}>
            <AnimatePresence mode="wait">
                {/* the words make their own entrance (tutorial.sass); the old ones simply fade as they go */}
                <motion.div key={words} initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 0.8, 0.24, 1] }}>
                    <Words text={words} onLit={() => setLit(true)}/>
                </motion.div>
            </AnimatePresence>
        </div> : null}

        {/* Next, in the guess button's place and style: greyed until the words have had their shimmer, and with a spinner
            while the guesses are being shown */}
        {boxes.bar ? <div className="absolute flex flex-col justify-center px-4 pb-2" style={{ ...place(boxes.bar), height: Math.min(boxes.bar.height, 100) }}>
            <button type="button" onClick={advance} disabled={waiting} aria-busy={watching}
                    className={`pointer-events-auto flex h-12 w-full items-center justify-center gap-2 rounded-lg px-5 text-[16px] font-medium transition-colors duration-300 active:scale-[0.98] ${waiting ? "bg-play-raised text-play-faint" : "bg-play-text text-play-bg"}`}>
                {watching ?
                    <span role="status" aria-label="Showing a round" className="flex items-center gap-1.5">
                        {[0, 1, 2].map(i => <motion.span key={i} className="size-1.5 rounded-full bg-current"
                                                         animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}/>)}
                    </span> :
                    <>{step.next}<ArrowRightIcon className="size-5 shrink-0" strokeWidth={2}/></>}
            </button>
        </div> : null}
    </div>;
}
