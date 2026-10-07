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
    CircleQuestionMarkIcon,
    FlameIcon,
    MinusIcon,
    PlusIcon,
    Share2Icon,
    StarIcon,
} from "lucide-react";
import { useDisclosure } from "@heroui/react";
import Help from "@/app/play/[game]/help";
import colours from "@/app/play/[game]/map/config/colours.json";
import groups from "@/app/play/[game]/map/config/groups.json";
import { playTheme } from "@/core/style/play-theme";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.18 } };
const stepper = "flex size-12 shrink-0 items-center justify-center rounded-full border border-play-line bg-play-surface text-play-text transition active:scale-95 disabled:text-play-faint disabled:opacity-50";

/**
 * One height for the footer in every state (choosing, guessing, game over), so the map above it never resizes when the
 * state changes: the guessing footer is the tallest content, and the others are padded to match it.
 */
const FOOTER = "h-[100px]";

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

/** A half sun on the horizon, rising or setting (lucide's Sunrise, minus the arrow) */
const HalfSunIcon = ({ className, strokeWidth = 2, ...rest }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
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

/** The glow the stars have, in whatever colour the icon is */
const GLOW = "[filter:drop-shadow(0_0_6px_color-mix(in_srgb,currentColor_55%,transparent))_drop-shadow(0_0_16px_color-mix(in_srgb,currentColor_25%,transparent))]";

/** A carousel stat: a glowing icon, a serif figure and a quiet label; `dim` when there's nothing to show yet */
const Stat = ({ icon, value, label, colour, dim = false }: { icon: React.ReactNode, value?: string, label: string, colour: string, dim?: boolean }) => (
    <span className="flex items-center justify-center gap-2.5 whitespace-nowrap">
        <span className={`flex shrink-0 items-center ${dim ? "text-play-line" : GLOW}`} style={dim ? undefined : { color: colour }}>{icon}</span>
        {value ? <span className="font-clue text-[24px] font-medium leading-none text-play-text lining-nums">{value}</span> : null}
        <span className="text-[14px] text-play-muted">{label}</span>
    </span>
);

/** Carousel slides move sideways: in from the right, out to the left */
const slide = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.22 } };

/** One line at a time, cross-fading to the next every few seconds (a single slide just sits there) */
const Carousel = ({ slides }: { slides: Array<{ key: string, node: React.ReactNode }> }) => {
    const [index, setIndex] = useState(0);
    const count = slides.length;

    useEffect(() => {
        if (count < 2) return;

        const t = setInterval(() => setIndex(i => i + 1), 6000);
        return () => clearInterval(t);
    }, [count]);

    const current = slides[index % count];
    return (
        <div className="flex h-7 w-full items-center justify-center text-[14px] leading-none text-play-muted">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={current.key} {...slide} className="max-w-full">{current.node}</motion.div>
            </AnimatePresence>
        </div>
    );
}

const Action = (props: any) => {
    const help = useDisclosure();
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

    function calcStreakIcon(): string {
        const streak = CompletionUtil.calcStreak();

        if      (streak >= 50) return '💎';
        else if (streak >= 25) return '🏅';
        else if (streak >= 10) return '🥈';
        else if (streak >= 5)  return '🥉';
        else if (streak >= 0)  return '🔥';
        else                   return '😵';

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
⭐ ${CompletionUtil.calcStars()} ${CompletionUtil.calcStreak() > 0 ? `${calcStreakIcon()} ${CompletionUtil.calcStreak()} ` : ''}📖 ${CompletionUtil.calcPercentageCompletion(props.bible)}%`;
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
    const glass = !guessed && !excluded;

    if (props.playing) return (
        <AnimatePresence mode="wait" initial={false}>
            {!props.hasBook ?
                <motion.div key="hint" {...fade} className={`flex ${FOOTER} items-center justify-center gap-2 px-4`}>
                    <button type="button" aria-label="How to play" onClick={help.onOpen}
                            className="flex size-11 items-center justify-center rounded-full text-play-muted hover:bg-play-raised hover:text-play-text">
                        <CircleQuestionMarkIcon className="size-5" strokeWidth={1.75}/>
                    </button>
                    <span className="text-[16px] text-play-muted">Tap the map to choose a chapter</span>
                    <Help isOpen={help.isOpen} onOpenChange={help.onOpenChange}/>
                </motion.div> :
                <motion.div key="guess" {...fade} className={`flex ${FOOTER} flex-col justify-center gap-2.5 px-4`}>
                    <div className="flex items-center gap-2">
                        <button type="button" aria-label="Previous chapter" disabled={!props.canStep(-1)}
                                onClick={() => props.step(-1)} className={stepper}>
                            <MinusIcon className="size-5"/>
                        </button>
                        <button type="button" disabled={guessed || !!excluded} onClick={submit}
                                aria-label={excluded ? undefined : `${guessed ? "Guessed" : "Guess"} ${props.selected.book} ${props.chapter}`}
                                style={glass ? {
                                    "--tint": tint,
                                    background: `linear-gradient(180deg, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0.12) 48%, transparent 52%), linear-gradient(135deg, color-mix(in srgb, var(--tint) 75%, white), var(--tint) 60%, color-mix(in srgb, var(--tint) 88%, black))`,
                                    boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.65), inset 0 -1px 0 color-mix(in srgb, var(--tint) 70%, black), 0 4px 18px -4px color-mix(in srgb, var(--tint) 70%, transparent)`,
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
        </AnimatePresence>
    );

    const won = props.guesses.some((guess: any) => parseInt(guess.closeness.distance) == 0);
    const streak = CompletionUtil.calcStreak();
    const isToday = moment(props.date).isSame(moment(), "day");

    const totalStars = CompletionUtil.calcStars();
    const percentRead = parseFloat(CompletionUtil.calcPercentageCompletion(props.bible, 1));
    const slides: Array<{ key: string, node: React.ReactNode }> = [
        { key: "stars", node:
            <span className="flex items-center gap-1.5" aria-label={`${props.stars} of 5 stars`}>
                {[...Array(5)].map((_, index: number) =>
                    index < props.stars ?
                        <Star key={`star-${index}`} filled popping={popping && index == props.stars - 1}
                              className="!size-7 !text-play-accent"/> :
                        <StarIcon key={`star-${index}`} className="size-7 text-play-line" fill="none" strokeWidth={1.5} aria-hidden="true"/>
                )}
            </span>
        },
        { key: "total", node: totalStars > 0 ?
            <Stat colour={playTheme.accent} value={String(totalStars)} label={totalStars == 1 ? "star in total" : "stars in total"}
                  icon={<Star filled shadow={false} className="!size-6 !text-current"/>}/> :
            <Stat dim label="No stars yet" colour={playTheme.accent} icon={<StarIcon className="size-6" fill="none" strokeWidth={1.5}/>}/>
        },
        { key: "streak", node: streak > 0 ?
            <Stat colour="#e8955a" value={String(streak)} label="day streak"
                  icon={<FlameIcon className="size-6" fill="currentColor" fillOpacity={0.3} strokeWidth={1.75}/>}/> :
            <Stat dim label="No streak yet, win a day to start one" colour="#e8955a" icon={<FlameIcon className="size-6" strokeWidth={1.5}/>}/>
        },
        { key: "read", node: percentRead > 0 ?
            <Stat colour={playTheme.teal} value={`${percentRead}%`} label="of the Bible read"
                  icon={<BookOpenIcon className="size-6" fill="currentColor" fillOpacity={0.2} strokeWidth={1.75}/>}/> :
            <Stat dim label="Nothing read yet" colour={playTheme.teal} icon={<BookOpenIcon className="size-6" strokeWidth={1.5}/>}/>
        },
    ];

    return (
        <motion.section {...fade} className={`flex ${FOOTER} !w-full flex-col justify-center gap-3 px-4`}>
            <Carousel slides={slides}/>
            <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={share} aria-live="polite" aria-label={shared && !copied && isToday ? "Copy results again" : undefined}
                        className="flex h-12 items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-play-text px-3 text-[15px] font-semibold text-play-bg transition active:scale-[0.98]">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={copied ? "copied" : shared && isToday ? "countdown" : "share"} {...fade} className="flex items-center gap-2">
                            {copied ?
                                <><CheckIcon className="size-4 shrink-0" strokeWidth={2.5}/>Copied!</> :
                                shared && isToday ?
                                    <><HalfSunIcon className="size-[18px] shrink-0" strokeWidth={2.25} aria-label="Next chapter in"/><Countdown/></> :
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
