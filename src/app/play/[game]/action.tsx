"use client"

import { guess } from "@/core/action/play/guess";
import Link from "next/link";
import moment from "moment";
import { CalendarDate } from "@internationalized/date";
import { CompletionUtil } from "@/core/util/completion-util";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Star } from "@/app/play/[game]/star";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRightIcon,
    BookOpenIcon,
    CheckIcon,
    MinusIcon,
    MousePointerClickIcon,
    PointerIcon,
    PlusIcon,
    Share2Icon,
    StarIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import Help from "@/app/play/[game]/help";
import MyStats from "@/app/play/[game]/my-stats";
import colours from "@/app/play/[game]/map/config/colours.json";
import groups from "@/app/play/[game]/map/config/groups.json";
import { playTheme } from "@/core/style/play-theme";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.18 } };
/** The footer's switch between choosing and guessing: no exit and no movement, just a quick fade-in, so it never lags */
const quick = { initial: { opacity: 0.4 }, animate: { opacity: 1 }, transition: { duration: 0.12 } };
const stepper = "flex size-12 shrink-0 items-center justify-center rounded-full border border-play-line bg-play-surface text-play-text transition active:scale-95 disabled:text-play-faint disabled:opacity-50";

/**
 * One height for the footer in every state (choosing, guessing, game over), so the map above it never resizes when the
 * state changes: the guessing footer is the tallest content, and the others are centred in the same height. The bottom
 * padding is part of it, so the buttons keep a little room below them.
 */
const FOOTER = "h-[100px] pb-2";

const MAX_GUESSES = 5;


/** A guess's colour by how far off it was, in step with the share text's squares (calcGuessBlocks) */
function closenessColour(distance: number): string {
    const d = Math.abs(distance);
    if (d <= 500)  return playTheme.green;
    if (d <= 2000) return playTheme.gold;
    if (d <= 5000) return playTheme.orange;
    return playTheme.rose;
}

/** The named chapter group (map/config/groups.json) a chapter falls in, e.g. "Rise of David" */
function groupOf(book: string, chapter: number): string | undefined {
    return (groups as Record<string, Array<{ name: string, start: number, end: number }>>)[book.toLowerCase()]
        ?.find(({ start, end }) => chapter >= start && chapter <= end)?.name;
}

/** Font sizes (px) for the passage on the guess button, largest first */
const PASSAGE_SIZES = [16, 15, 14, 13];
/** ...and on the read link, which starts a size smaller */
const READ_SIZES = [15, 14, 13, 12];

/**
 * The full passage on the guess button (or read link), shrunk a step at a time until it fits the width.
 * Re-measured whenever the button resizes; keyed by passage so a new one starts at the largest size.
 */
const Passage = ({ book, chapter, sizes = PASSAGE_SIZES }: { book: string, chapter: string, sizes?: number[] }) => {
    const label = useRef<HTMLSpanElement>(null);
    const [step, setStep] = useState(0);

    useLayoutEffect(() => {
        const el = label.current;
        if (el && step < sizes.length - 1 && el.scrollWidth > el.clientWidth) setStep(step + 1);
    }, [step, sizes.length]);

    useEffect(() => {
        const button = label.current?.closest("button, a");
        if (!button) return;

        const observer = new ResizeObserver(() => setStep(0)); // try the largest size again at the new width
        observer.observe(button);
        return () => observer.disconnect();
    }, []);

    return (
        <span ref={label} className="min-w-0 overflow-hidden whitespace-nowrap font-semibold tabular-nums"
              style={{ fontSize: sizes[step] }}>
            {book} {chapter}
        </span>
    );
}

/** Time left until the next daily chapter (local midnight), as h:mm:ss */
const Countdown = () => {
    const [now, setNow] = useState(() => moment());
    useEffect(() => {
        const t = setInterval(() => setNow(moment()), 1000);
        return () => clearInterval(t);
    }, []);

    const left = moment.duration(moment(now).add(1, "day").startOf("day").diff(now));
    return <span className="tabular-nums">{`${Math.floor(left.asHours())}:${String(left.minutes()).padStart(2, "0")}:${String(left.seconds()).padStart(2, "0")}`}</span>;
}

const glyph = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

const InfoGlyph = ({ className }: { className?: string }) => (
    <svg {...glyph} strokeWidth={2.5} className={className} aria-hidden="true"><path d="M12 11v6"/><path d="M12 7h.01"/></svg>
);

const AlertGlyph = ({ className }: { className?: string }) => (
    <svg {...glyph} strokeWidth={2.5} className={className} aria-hidden="true"><path d="M12 7v6"/><path d="M12 17h.01"/></svg>
);

/** The chosen horizon icon, without the sunrise arrow. */
const HalfSunIcon = ({ className, strokeWidth = 2, ...rest }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 3 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
        <path d="M12 10V8"/>
        <path d="m4.93 10.93 1.41 1.41"/>
        <path d="M2 18h2"/>
        <path d="M20 18h2"/>
        <path d="m19.07 10.93-1.41 1.41"/>
        <path d="M22 22H2"/>
        <path d="M16 18a4 4 0 0 0-8 0"/>
    </svg>
);

const Action = (props: any) => {
    // A temporary “pop” on the newest star, only when the game is won now (not when a finished game is reloaded)
    const [popping, setPopping] = useState(false);
    // true for a moment after the results are copied, so the share button can say so itself
    const [copied, setCopied] = useState(false);
    // once the results have been shared, the button settles on the countdown (today's game only) instead of "Share"
    const [shared, setShared] = useState(false);

    useEffect(() => {
        if (!props.celebrate || !props.stars) return;

        setPopping(true);
        const t = setTimeout(() => setPopping(false), 450); // match the duration-300 plus a bit of linger
        return () => clearTimeout(t);
    }, [props.celebrate, props.stars]);

    function calcGuessBlocks() {
        let guessBlocks = '';

        for (const guess of props.guesses) {
            const distance = Math.abs(guess.closeness.distance);
            if (distance == 0)       continue
            if (distance <= 100)   { guessBlocks += '🟩'; continue; }
            if (distance <= 500)   { guessBlocks += '🟩'; continue; }
            if (distance <= 2000)  { guessBlocks += '🟨'; continue; }
            if (distance <= 5000)  { guessBlocks += '🟧';           }
            else                   { guessBlocks += '🟥';           }
        }

        return guessBlocks;
    }

    useEffect(() => {
        if (!copied) return;

        const t = setTimeout(() => setCopied(false), 1800);
        return () => clearTimeout(t);
    }, [copied]);

    function share() {
        const resultText = results();
        navigator.clipboard.writeText(resultText).then(() => { setCopied(true); setShared(true); });

        // remove? improve? Slack vs Whatsapp vs Discord, etc...
        // const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(resultText)}`;
        // window.open(whatsappUrl, '_blank');
    }

    function results() {
        let won = false;
        props.guesses.forEach((guess: any) => {
            if (guess.closeness.distance == 0) won = true;
        })

        return `bible.game
${moment(new CalendarDate(parseInt(props.date.split('-')[0]), parseInt(props.date.split('-')[1]) - 1, parseInt(props.date.split('-')[2]))).format('Do MMM YYYY')}
${calcGuessBlocks()}${'🎉'.repeat(5 - props.guesses.length + (won ? 1 : 0))}
⭐ ${CompletionUtil.calcStars()} 📖 ${CompletionUtil.calcPercentageCompletion(props.bible)}%`;
    }

    function submit() {
        navigator.vibrate?.(12);
        guess(props.date, props.selected.book, props.selected.chapter, props.passage).then((guess: any) => {
            props.addGuess(guess)
        })
    }

    const guessed = props.hasBook && props.isExistingGuess();
    // a chapter the guesses exclude can't be guessed; the button says why instead
    const excluded: string | undefined = guessed ? undefined : props.ruledOut;

    // the selected chapter's division colour (the map's own), and the group it falls in
    const bookKey = props.bible.testaments.flatMap((t: any) => t.divisions).flatMap((d: any) => d.books)
        .find((bk: any) => bk.name == props.selected.book)?.key;
    const tint: string = (colours as Record<string, string>)[bookKey] ?? playTheme.text;
    const group = props.hasBook ? groupOf(props.selected.book, parseInt(props.chapter)) : undefined;
    const ready = !guessed && !excluded;

    if (props.playing) return (
        <>
            {!props.hasBook ?
                <motion.div key="hint" {...quick} className={`flex ${FOOTER} flex-col justify-center gap-2 px-4`}>
                    {/* a ghost of the guess row below, so choosing a chapter fills it in rather than swapping it out */}
                    <div className="flex items-center gap-2">
                        <Help>
                            <button type="button" aria-label="How to play" title="How to play" className={stepper}
                                    style={{ color: "#4cc9ff", borderColor: "color-mix(in srgb, #4cc9ff 40%, transparent)" }}>
                                <InfoGlyph className="size-6"/>
                            </button>
                        </Help>
                        <span aria-hidden="true" className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-dashed border-play-line bg-play-surface px-5 text-[16px] text-play-muted">
                            <span className="flex items-center gap-2 [@media(hover:hover)_and_(pointer:fine)]:hidden">
                                <PointerIcon className="size-5 shrink-0" strokeWidth={1.75}/>Tap the map
                            </span>
                            <span className="hidden items-center gap-2 [@media(hover:hover)_and_(pointer:fine)]:flex">
                                <MousePointerClickIcon className="size-5 shrink-0" strokeWidth={1.75}/>Click to pick
                            </span>
                        </span>
                        {props.info ?
                            <MyStats info={props.info} bible={props.bible} className={stepper}/> :
                            <Popover placement="top-end" offset={12} showArrow classNames={{
                                content: "play-ui max-w-[17rem] rounded-lg border border-play-line bg-play-surface p-3.5 text-play-text shadow-xl",
                                arrow: "bg-play-surface",
                            }}>
                                <PopoverTrigger>
                                    <button type="button" aria-label="You're not logged in. Show details" title="Save your progress" className={stepper}
                                            style={{ color: "#e8b04f", borderColor: "color-mix(in srgb, #e8b04f 40%, transparent)" }}>
                                        <AlertGlyph className="size-6"/>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="flex flex-col gap-3">
                                        <p className="text-[14px] leading-snug">
                                            <span className="font-semibold">You&apos;re not logged in.</span>{" "}
                                            <span className="text-play-muted">Your progress is only saved on this device. Log in to keep your streak and stars.</span>
                                        </p>
                                        <Link href="/account/log-in"
                                              className="flex h-10 items-center justify-center rounded-full bg-play-text text-[14px] font-semibold text-play-bg transition active:scale-[0.98]">
                                            Log in
                                        </Link>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        }
                    </div>
                    <p className="text-center text-[12px] leading-none text-play-muted"
                       aria-label={`Guess ${Math.min(props.guesses.length + 1, MAX_GUESSES)} of ${MAX_GUESSES}`}>
                        <span className="mb-1.5 flex items-center justify-center gap-2" aria-hidden="true">
                            {[...Array(MAX_GUESSES)].map((_, index: number) => {
                                const guessed = props.guesses[index];
                                return (
                                    <span key={index} className={`size-2.5 rounded-full transition-colors ${!guessed && index == props.guesses.length ? "ring-1 ring-play-muted" : ""}`}
                                          style={{ background: guessed ? closenessColour(guessed.closeness.distance) : playTheme.line }}/>
                                );
                            })}
                        </span>
                        <span aria-hidden="true">Guess {Math.min(props.guesses.length + 1, MAX_GUESSES)} of {MAX_GUESSES}</span>
                    </p>
                </motion.div> :
                <motion.div key="guess" {...quick} className={`flex ${FOOTER} flex-col justify-center gap-2 px-4`}>
                    <div className="flex items-center gap-2">
                        <button type="button" aria-label="Previous chapter" disabled={!props.canStep(-1)}
                                onClick={() => props.step(-1)} className={stepper}>
                            <MinusIcon className="size-5"/>
                        </button>
                        <button type="button" disabled={guessed || !!excluded} onClick={submit}
                                aria-label={excluded ? undefined : `${guessed ? "Guessed" : "Guess"} ${props.selected.book} ${props.chapter}`}
                                style={ready ? {
                                    "--tint": tint,
                                    background: `linear-gradient(180deg, rgb(255 255 255 / 0.3) 0%, rgb(255 255 255 / 0.08) 48%, transparent 52%), linear-gradient(135deg, color-mix(in srgb, var(--tint) 75%, white), var(--tint) 60%, color-mix(in srgb, var(--tint) 88%, black))`,
                                    boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.4), inset 0 -1px 0 color-mix(in srgb, var(--tint) 70%, black), 0 3px 12px -4px color-mix(in srgb, var(--tint) 45%, transparent)`,
                                } as React.CSSProperties : undefined}
                                className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-play-text px-5 text-[16px] font-medium text-play-bg transition active:scale-[0.98] disabled:bg-play-raised disabled:text-play-faint">
                            {excluded ?
                                <span className="truncate">{excluded}</span> :
                                <>
                                    {guessed ? <CheckIcon className="size-5 shrink-0" strokeWidth={2.25} aria-label="Guessed"/> : null}
                                    <Passage key={`${props.selected.book} ${props.chapter}`} book={props.selected.book} chapter={props.chapter}/>
                                    {guessed ? null : <ArrowRightIcon className="size-5 shrink-0" strokeWidth={2}/>}
                                </>
                            }
                        </button>
                        <button type="button" aria-label="Next chapter" disabled={!props.canStep(1)}
                                onClick={() => props.step(1)} className={stepper}>
                            <PlusIcon className="size-5"/>
                        </button>
                    </div>
                    <p className="min-w-0 text-center leading-tight" aria-label="Where this chapter sits">
                        <span className="block truncate text-[15px] font-medium" style={{ color: tint }}>{group ?? props.selected.division}</span>
                        <span className="mt-0.5 block truncate text-[12px] text-play-muted">
                            {props.selected.testament} · {props.selected.division}
                        </span>
                    </p>
                </motion.div>
            }
        </>
    );

    const isToday = moment(props.date).isSame(moment(), "day");

    return (
        <motion.section {...fade} className={`flex ${FOOTER} !w-full flex-col justify-center gap-3 px-4`}>
            <span className="flex items-center justify-center gap-1.5" aria-label={`${props.stars} of 5 stars`}>
                {[...Array(5)].map((_, index: number) =>
                    index < props.stars ?
                        <Star key={`star-${index}`} filled popping={popping && index == props.stars - 1}
                              className="!size-7 !text-play-accent"/> :
                        <StarIcon key={`star-${index}`} className="size-7 text-play-line" fill="none" strokeWidth={1.5} aria-hidden="true"/>
                )}
            </span>
            <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={share} aria-live="polite" aria-label={shared && !copied && isToday ? "Copy results again" : undefined}
                        className="flex h-12 items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-play-text px-3 text-[15px] font-semibold text-play-bg transition active:scale-[0.98]">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={copied ? "copied" : shared && isToday ? "countdown" : "share"} {...fade} className="flex items-center gap-2">
                            {copied ?
                                <><CheckIcon className="size-4 shrink-0" strokeWidth={2.5}/>Copied!</> :
                                shared && isToday ?
                                    <><HalfSunIcon className="size-[22px] shrink-0" strokeWidth={2.25} aria-label="Next chapter in"/><Countdown/></> :
                                    <><Share2Icon className="size-4 shrink-0" strokeWidth={2.25}/>Share</>
                            }
                        </motion.span>
                    </AnimatePresence>
                </button>
                <Link href={`/read/${props.passage.book.replace(/ /g, "")}${props.passage.chapter}`}
                      className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-full border border-play-line bg-play-surface px-3 text-[15px] font-semibold text-play-text transition active:scale-[0.98]">
                    <BookOpenIcon className="size-4 shrink-0" strokeWidth={2.25}/>
                    <Passage key={`${props.passage.book} ${props.passage.chapter}`} book={props.passage.book} chapter={props.passage.chapter} sizes={READ_SIZES}/>
                </Link>
            </div>
        </motion.section>
    );
}

export default Action;
