"use client"

import { toast } from "react-hot-toast";
import { guess } from "@/core/action/play/guess";
import Link from "next/link";
import moment from "moment";
import { CalendarDate } from "@internationalized/date";
import { CompletionUtil } from "@/core/util/completion-util";
import React, { useEffect, useState } from "react";
import { Star } from "@/app/play/[game]/star";
import { useQuery } from "@tanstack/react-query";
import { getPassage } from "@/core/action/read/get-passage";
import { ReadingUtil } from "@/core/util/reading-util";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRightIcon,
    BookOpenIcon,
    CircleQuestionMarkIcon,
    MinusIcon,
    PlusIcon,
    Share2Icon,
    StarIcon,
} from "lucide-react";
import { useDisclosure } from "@heroui/react";
import Help from "@/app/play/[game]/help";

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.18 } };
const stepper = "flex size-12 shrink-0 items-center justify-center rounded-full border border-play-line bg-play-surface text-play-text transition active:scale-95 disabled:text-play-faint disabled:opacity-50";

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

const Action = (props: any) => {
    const help = useDisclosure();
    // A temporary “pop” on the newest star, only when the game is won now (not when a finished game is reloaded)
    const [popping, setPopping] = useState(false);

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

    function share() {
        const resultText = results();
        navigator.clipboard.writeText(resultText);
        toast.success("Results copied!");

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

    const reading = useQuery({
        queryKey: ['passage', `${props.passage.book}${props.passage.chapter}`, 'web'],
        queryFn: () => getPassage(`${props.passage.book}${props.passage.chapter}`, 'web'),
        enabled: !props.playing,
        staleTime: Infinity,
    });
    const minutes = ReadingUtil.calcMinutes(reading.data?.text);

    function submit() {
        navigator.vibrate?.(12);
        guess(props.date, props.selected.book, props.selected.chapter, props.passage).then((guess: any) => {
            props.addGuess(guess)
        })
    }

    const guessed = props.hasBook && props.isExistingGuess();
    const chapter = parseInt(props.chapter) || 1;

    if (props.playing) return (
        <AnimatePresence mode="wait" initial={false}>
            {!props.hasBook ?
                <motion.div key="hint" {...fade} className="flex h-[76px] items-center justify-center gap-2 px-4">
                    <button type="button" aria-label="How to play" onClick={help.onOpen}
                            className="flex size-11 items-center justify-center rounded-full text-play-muted hover:bg-play-raised hover:text-play-text">
                        <CircleQuestionMarkIcon className="size-5" strokeWidth={1.75}/>
                    </button>
                    <span className="text-[16px] text-play-muted">Tap the map to choose a chapter</span>
                    <Help isOpen={help.isOpen} onOpenChange={help.onOpenChange}/>
                </motion.div> :
                <motion.div key="guess" {...fade} className="flex h-[76px] items-center gap-2 px-4">
                    <button type="button" aria-label="Previous chapter" disabled={chapter <= 1}
                            onClick={() => props.step(-1)} className={stepper}>
                        <MinusIcon className="size-5"/>
                    </button>
                    <button type="button" disabled={guessed} onClick={submit}
                            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-play-text px-5 text-[16px] text-play-bg transition active:scale-[0.98] disabled:bg-play-raised disabled:text-play-faint">
                        <span className="shrink-0">{guessed ? "Guessed" : "Guess"}</span>
                        <span className="truncate font-semibold tabular-nums">{props.selected.book} {props.chapter}</span>
                        {guessed ? null : <ArrowRightIcon className="size-5 shrink-0" strokeWidth={2}/>}
                    </button>
                    <button type="button" aria-label="Next chapter" disabled={chapter >= props.maxChapter}
                            onClick={() => props.step(1)} className={stepper}>
                        <PlusIcon className="size-5"/>
                    </button>
                </motion.div>
            }
        </AnimatePresence>
    );

    const won = props.guesses.some((guess: any) => parseInt(guess.closeness.distance) == 0);
    const streak = CompletionUtil.calcStreak();
    const isToday = moment(props.date).isSame(moment(), "day");

    return (
        <motion.section {...fade} className="flex !w-full flex-col gap-3 px-4 pb-3 pt-4">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-clue text-[20px] font-medium leading-tight text-play-text">
                        {won ?
                            `Found in ${props.guesses.length}` :
                            <>The answer was <span className="whitespace-nowrap font-clue">{props.passage.book} {props.passage.chapter}</span></>
                        }
                    </p>
                    <p className="mt-0.5 truncate text-[13px] text-play-muted">
                        {streak > 0 ? `${calcStreakIcon()} ${streak} day streak` : null}
                        {streak > 0 && isToday ? " · " : null}
                        {isToday ? <>Next chapter in <Countdown/></> : null}
                        {streak <= 0 && !isToday ? "Pick another day from the calendar" : null}
                    </p>
                </div>
                <span className="flex shrink-0 items-center gap-0.5" aria-label={`${props.stars} of 5 stars`}>
                    {[...Array(5)].map((_, index: number) =>
                        index < props.stars ?
                            <Star key={`star-${index}`} filled shadow={false} popping={popping && index == props.stars - 1}
                                  className="!size-5 !text-play-accent"/> :
                            <StarIcon key={`star-${index}`} className="size-5 text-play-line" fill="currentColor" strokeWidth={0} aria-hidden="true"/>
                    )}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={share}
                        className="flex h-12 items-center justify-center gap-2 rounded-full bg-play-text text-[15px] font-semibold text-play-bg transition active:scale-[0.98]">
                    <Share2Icon className="size-4" strokeWidth={2.25}/>Share
                </button>
                <Link href={`/read/${props.passage.book.replace(/ /g, "")}${props.passage.chapter}`}
                      className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-full border border-play-line bg-play-surface px-3 text-[15px] font-semibold text-play-text transition active:scale-[0.98]">
                    <BookOpenIcon className="size-4 shrink-0" strokeWidth={2.25}/>
                    <span className="truncate">Read {props.passage.book} {props.passage.chapter}</span>
                    <span className="shrink-0 font-normal text-play-muted">{minutes ? `${minutes}m` : ""}</span>
                </Link>
            </div>
        </motion.section>
    );
}

export default Action;
