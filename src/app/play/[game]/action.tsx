"use client"

import { toast } from "react-hot-toast";
import { guess } from "@/core/action/play/guess";
import { redirect } from "next/navigation";
import moment from "moment";
import { CalendarDate } from "@internationalized/date";
import { CompletionUtil } from "@/core/util/completion-util";
import React, { useEffect, useState } from "react";
import { Star } from "@/app/play/[game]/star";
import { useQuery } from "@tanstack/react-query";
import { getPassage } from "@/core/action/read/get-passage";
import { ReadingUtil } from "@/core/util/reading-util";
import { ArrowRightIcon, CircleQuestionMarkIcon } from "lucide-react";
import { useDisclosure } from "@heroui/react";
import Help from "@/app/play/[game]/help";

const line = "flex h-full w-full items-center justify-center gap-3 text-[16px] text-[#dfdfdf]";

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
        guess(props.date, props.selected.book, props.selected.chapter, props.passage).then((guess: any) => {
            props.addGuess(guess)
        })
    }

    const guessed = props.hasBook && props.isExistingGuess();

    if (props.playing && !props.hasBook) return (
        <div className={line}>
            <button type="button" aria-label="How to play" onClick={help.onOpen}
                    className="-m-2 p-2 text-[#dfdfdf] hover:text-[#ffffff]">
                <CircleQuestionMarkIcon className="size-5" strokeWidth={1.5}/>
            </button>
            <span className="font-light">Tap the map</span>
            <Help isOpen={help.isOpen} onOpenChange={help.onOpenChange}/>
        </div>
    );

    if (props.playing) return (
        <button type="button" disabled={guessed} onClick={submit}
                className={line + " text-[#ffffff] disabled:text-[#606060]"}>
            <span className="font-light">{guessed ? "Already guessed" : "Guess"}</span>
            <span className="-ml-1.5 font-semibold">{props.selected.book} {props.chapter}</span>
            {guessed ? null : <ArrowRightIcon className="size-6" strokeWidth={1.25}/>}
        </button>
    );

    return (
        <section className="grid h-full !w-full grid-cols-2">
            <button type="button" onClick={share} className="flex flex-col items-center justify-center gap-1.5">
                <span className="text-[16px] font-semibold text-[#ffffff]">Share Result</span>
                <span className="flex h-6 items-center gap-1.5" aria-label={`${props.stars} of 5 stars`}>
                    {props.stars ?
                        [...Array(props.stars)].map((_, index: number) => (
                            <Star key={`star-${index}`} filled shadow={false} popping={popping && index == props.stars - 1}
                                  className="!size-6 !text-[#d4be38]"/>
                        )) :
                        <span className="text-[15px] font-light text-[#bfbfbf]">No stars</span>
                    }
                </span>
            </button>
            <button type="button" className="flex flex-col items-center justify-center gap-1.5"
                    onClick={() => redirect(`/read/${props.passage.book.replace(/ /g, "")}${props.passage.chapter}`)}>
                <span className="text-[16px] font-semibold text-[#ffffff]">Daily Reading</span>
                <span className="flex h-6 items-center text-[15px] font-light text-[#bfbfbf]">
                    {minutes ? `${minutes} min${minutes == 1 ? "" : "s"}` : "…"}
                </span>
            </button>
        </section>
    );
}

export default Action;
