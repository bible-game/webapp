"use client"

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { NumberInput } from "@heroui/number-input";
import { Button } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { guess } from "@/core/action/play/guess";
import { redirect } from "next/navigation";
import moment from "moment";
import { CalendarDate } from "@internationalized/date";
import { CompletionUtil } from "@/core/util/completion-util";
import React, { useEffect, useRef, useState } from "react";
import { Star } from "@/app/play/[game]/star";

const Action = (props: any) => {
    // Track the newest star to trigger a temporary “pop” animation
    const [popping, setPopping] = useState<Set<number>>(new Set());
    const prevStarsRef = useRef<number>(props.stars);

    useEffect(() => {
        if (props.stars > prevStarsRef.current) {
            const newestIndex = props.stars - 1; // 0-based index of the newest star
            setPopping((prev) => {
                const next = new Set(prev);
                next.add(newestIndex);
                return next;
            });
            // Remove the pop class after a short delay
            const t = setTimeout(() => {
                setPopping((prev) => {
                    const next = new Set(prev);
                    next.delete(newestIndex);
                    return next;
                });
            }, 450); // match the duration-300 plus a bit of linger
            return () => clearTimeout(t);
        }
        prevStarsRef.current = props.stars;
    }, [props.stars]);

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

    return <section className="!w-full">{
        props.playing ? <section className="grid !w-full grid-cols-2 gap-2 sm:grid-cols-1">
                <Autocomplete
                    className="w-full text-[10px] uppercase tracking-[0.16em]"
                    inputProps={{
                        classNames: {
                            inputWrapper: "!h-[42px] rounded-none border border-[#7d7a74] bg-[#0a0b0c] shadow-none",
                            input: "text-[#f2efe8] text-[10px] uppercase tracking-[0.16em]",
                            label: "!text-[#a19d94] text-[10px] uppercase tracking-[0.16em]",
                        }
                    }}
                    classNames={{
                        selectorButton: "text-[#a19d94] opacity-80"
                    }}
                    defaultItems={props.books}
                    isReadOnly={!!props.bookFound}
                    startContent={props.bookFound}
                    selectedKey={props.selected.book}
                    label="Book"
                    onClear={() => props.clearSelection()}
                    onSelectionChange={(key: any) => {
                        props.selectBook(key)
                    }}
                    variant="bordered">
                    {(item: any) =>
                        <AutocompleteItem className="text-black text-sm"
                                          key={item.name}>{item.name}</AutocompleteItem>}
                </Autocomplete>
                <NumberInput
                    classNames={{
                        base: "w-full text-[10px] uppercase tracking-[0.16em] !opacity-100",
                        inputWrapper: "!h-[42px] rounded-none border border-[#7d7a74] bg-[#0a0b0c] shadow-none",
                        input: "text-[#f2efe8] text-[10px] uppercase tracking-[0.16em]",
                        label: "!text-[#a19d94] text-[10px] uppercase tracking-[0.16em]",
                        stepperButton: "text-[#a19d94] opacity-80"
                    }}
                    value={props.hasBook ? parseInt(props.chapter) : undefined}
                    maxValue={props.hasBook ? props.maxChapter : undefined}
                    onChange={(e: any) => props.selectChapter(e)}
                    minValue={1}
                    label="Chapter"
                    isDisabled={!props.hasBook}
                    hideStepper={!props.hasBook}
                    variant="bordered"
                    className="w-full"
                    endContent={!props.hasBook ? undefined :
                        <div className={"w-full text-left text-[#5c5954] relative right-[0rem]"}>/ {props.maxChapter} </div>
                    }
                />
                <Button
                    className="col-span-2 mt-1 h-[42px] w-full rounded-none border border-[#a19d94] bg-[#0a0b0c] text-[10px] uppercase tracking-[0.2em] text-[#f2efe8] hover:!border-[#f2efe8] hover:!bg-[#0a0b0c] sm:col-span-1"
                    variant="bordered"
                    onPress={() => {
                        if (props.isExistingGuess()) toast.error("You have already guessed this!")
                        else {
                            guess(props.date, props.selected.book, props.selected.chapter, props.passage).then((guess: any) => {
                                console.log(props.passage)
                                props.addGuess(guess)
                            })
                        }
                    }}>Guess <span className="font-extralight tracking-[0.16em]">({props.guesses.length + 1}/5)</span></Button>
            </section> :
            <section className="grid !w-full grid-cols-2 items-center gap-2">
                <div className="group col-span-2 hidden justify-center gap-1 sm:flex">
                    {[...Array(props.stars)].map((_, index: number) => (
                        <Star key={`star-${index}`} filled popping={popping.has(index)} />
                    ))}
                    {[...Array(5 - props.stars)].map((_, index: number) => (
                        <Star
                            key={`blank-${index}`}
                            filled={false}
                            className="opacity-30"
                        />
                    ))}
                </div>

                <Button
                    className="h-[42px] w-full rounded-none border border-[#7d7a74] bg-[#0a0b0c] text-[10px] uppercase tracking-[0.16em] text-[#f2efe8] hover:!border-[#f2efe8] hover:!bg-[#0a0b0c]"
                    variant="bordered"
                    onPress={share}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                         strokeWidth={1.25} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
                    </svg>
                    Share Result
                </Button>
                <Button
                    className="h-[42px] w-full rounded-none border border-[#7d7a74] bg-[#0a0b0c] text-[10px] uppercase tracking-[0.16em] text-[#f2efe8] hover:!border-[#f2efe8] hover:!bg-[#0a0b0c]"
                    variant="bordered"
                    onPress={() => redirect(`/read/${props.passage.book.replace(/ /g, "")}${props.passage.chapter}`)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                         strokeWidth={1.25} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                    </svg>
                    Daily Reading
                </Button>
            </section>
    } </section>
}

export default Action;
