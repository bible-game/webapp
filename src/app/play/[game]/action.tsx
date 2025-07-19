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

const Action = (props: any) => {

    function calcGuessBlocks() {
        let guessBlocks = '';

        for (const guess of props.guesses) {
            const distance = Math.abs(guess.closeness.distance);
            if (distance == 0)     { continue }
            if (distance <= 100)   { guessBlocks += '🟩'; continue; }
            if (distance <= 500)   { guessBlocks += '🟩'; continue; }
            if (distance <= 2000)  { guessBlocks += '🟨'; continue; }
            if (distance <= 5000) { guessBlocks += '🟧' }
            else guessBlocks += '🟥'
        }

        return guessBlocks;
    }

    function results() {
        let won = false;
        props.guesses.forEach((guess: any) => {
            if (guess.closeness.distance == 0) won = true;
        })

        return `https://bible.game
${moment(new CalendarDate(parseInt(props.date.split('-')[0]), parseInt(props.date.split('-')[1]) - 1, parseInt(props.date.split('-')[2]))).format('Do MMM YYYY')}
${calcGuessBlocks()}${'🎉'.repeat(5 - props.guesses.length + (won ? 1 : 0))}
⭐ ${CompletionUtil.calcStars()} 📖 ${CompletionUtil.calcPercentageCompletion()}%`;
    }

    return                 <>{
        props.playing ? <section className="sm:panel flex justify-between mt-4 flex-wrap">
                <Autocomplete
                    className="sm:flex-1 text-sm sm:border-r-1 border-[#ffffff40] sm:rounded-l-full pl-4 pr-2 py-1 sm:w-[13.33rem] w-[50%]"
                    inputProps={{
                        classNames: {
                            inputWrapper: "border-0",
                            label: "!text-[#ffffff66]",
                        }
                    }}
                    classNames={{
                        selectorButton: "text-white opacity-40"
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
                        base: "sm:flex-1 text-sm sm:border-r-1 border-[#ffffff40] px-2 pr-2 py-1 !opacity-100",
                        inputWrapper: "border-0",
                        label: "!text-[#ffffff66]",
                        stepperButton: "text-white opacity-40"
                    }}
                    value={props.hasBook ? parseInt(props.chapter) : undefined}
                    maxValue={props.hasBook ? props.maxChapter : undefined}
                    onChange={(e: any) => props.selectChapter(e)}
                    minValue={1}
                    label="Chapter"
                    isDisabled={!props.hasBook}
                    hideStepper={!props.hasBook}
                    variant="bordered"
                    className="w-[50%] sm:w-[13.33rem]"
                    endContent={!props.hasBook ? undefined :
                        <div
                            className={"w-full text-left opacity-50 relative right-[3rem]"}>/ {props.maxChapter} </div>
                    }
                />
                <Button
                    className="border-0 sm:flex-1 text-white h-[48px] sm:h-[66px] text-sm rounded-l-none sm:rounded-r-full sm:w-[13.33rem] w-[100%] sm:-ml-[14px]"
                    variant="bordered"
                    onPress={() => {
                        if (props.isExistingGuess()) toast.error("You have already guessed this!")
                        // else if (props.isInvalidGuess(props.selected.icon)) toast.error(`Today's chapter is of theme ${props.passage.icon}!`)
                        else {
                            guess(props.date, props.selected.book, props.selected.chapter, props.passage).then((guess: any) => {
                                props.addGuess(guess)
                            })
                        }
                    }}>Guess <span className="font-extralight tracking-[1px]">({props.guesses.length + 1}/5)</span></Button>
            </section> :
            <section className="sm:panel flex justify-between mt-4 items-center flex-wrap">
                <div className="w-[100%] sm:w-[13.33rem] flex justify-center gap-0.5 mr-[3px]">
                    {[...Array(props.stars)].map((i: any, index: number) =>
                        <svg key={'star-'+index} xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24"
                             strokeWidth="1.5"
                             stroke="gold" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                        </svg>
                    )}
                    {[...Array(5 - props.stars)].map((i: any, index: number) =>
                        <div className="opacity-20" key={'blank-'+index}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#D9D9D9" viewBox="0 0 24 24"
                                 strokeWidth="1.5"
                                 stroke="#D9D9D9" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                            </svg>
                        </div>
                    )}
                </div>
                <Button
                    className="border-0 sm:flex-1 text-white h-[66px] text-sm rounded-none border-[#ffffff40] sm:border-x-1 w-[50%] sm:w-[13.33rem]"
                    variant="bordered"
                    onPress={() => {
                        navigator.clipboard.writeText(results())
                        toast.success("Results copied!")
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                         strokeWidth={1.25} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
                    </svg>
                    Share Result
                </Button>
                <Button
                    className="border-0 sm:flex-1 text-white h-[66px] text-sm rounded-l-none rounded-r-full w-[50%] sm:w-[13.33rem]"
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
    } </>
}

export default Action;