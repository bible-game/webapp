"use client"

import Display from "@/app/game/display/Display";
import Guess from "@/app/game/guess/Guess";
import React, { useEffect } from "react";
import Results from "@/app/game/results/Results";
import Text from "@/app/game/text/Text";
import _ from "lodash";
import moment from "moment";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button, useDisclosure } from "@nextui-org/react";
import { CheckIcon } from "@heroui/shared-icons";
import { Chip } from "@nextui-org/chip";
import { DatePicker } from "@heroui/date-picker";
import { NumberInput } from "@heroui/number-input";
import { guessAction } from "@/app/game/guess-action";
import { toast, Toaster } from "react-hot-toast";
import { getLocalTimeZone, today as TODAY, CalendarDate, parseDate, DateValue } from "@internationalized/date";

const Game = (props: any) => {
    const guessLimit = 5;
    const [today, setToday] = React.useState(moment(new Date()).format('YYYY-MM-DD'));

    function retrievePassage(date = today) {
        fetch(`${process.env.SVC_PASSAGE}/daily/${date}`, { method: "GET" })
            .then((response) => {
                response.json().then((data) => {
                    data.division = divisions.find((div: any) => div.books.some((book: any) => book.name == data.book)).name;
                    data.testament = props.bible.testaments.find((test: any) => test.divisions.some((div: any) => div.name == data.division)).name;
                    setPassage(data);
                });
            });
    }

    useEffect(() => {
        if (!passage.book) { // fixme :: hack
            flattenDivisions();
            flattenBooks();

            retrievePassage();
        }
    })

    const [passage, setPassage] = React.useState({} as any); // question :: apply type?
    const [guesses, setGuesses] = React.useState([] as any[]); // question :: apply type?
    const [testaments, setTestaments] = React.useState(props.bible.testaments);
    const [divisions, setDivisions] = React.useState([] as any[]);
    const [books, setBooks] = React.useState([] as any[]);
    const [allBooks, setAllBooks] = React.useState([] as any[]);
    const [allDivisions, setAllDivisions] = React.useState([] as any[]);
    const [chapters, setChapters] = React.useState([] as any);
    const [selected, setSelected] = React.useState({} as {testament: string, division: string, book: string, chapter: string});
    const [book, setBook] = React.useState('');
    const [chapter, setChapter] = React.useState('');

    const [testamentFound, setTestamentFound] = React.useState(false as any);
    const [divisionFound, setDivisionFound] = React.useState(false as any);
    const [bookFound, setBookFound] = React.useState(false as any);
    const [chapterFound, setChapterFound] = React.useState(false as any);

    const [playing, setPlaying] = React.useState(true);
    const [results, setResults] = React.useState(<></>);
    const [reading, setReading] = React.useState(false);

    const [dates, setDates] = React.useState([] as any[]);
    const [date, setDate] = React.useState<DateValue>(parseDate(TODAY(getLocalTimeZone()).toString()));

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [hasBook, setHasBook] = React.useState(false);
    const [maxChapter, setMaxChapter] = React.useState(0);

    const [stars, setStars] = React.useState(0);
    const [result, setResult] = React.useState("");

    const [potential, setPotential] = React.useState([] as any);

    function selectTestament(item: string): void {
        selected.testament = item;

        setDivisions(testaments.find(
            (test: any) => test.name === item
        ).divisions);
    }

    function flattenDivisions() {
        const divisions = [];
        for (const test of testaments) {
            for (const div of test.divisions) divisions.push(div);
        }
        setDivisions(divisions);
        setAllDivisions(divisions);
    }

    function flattenBooks() {
        const books = [];
        const potential = [];
        for (const div of divisions) {
            for (const book of div.books) {
                books.push(book);
                potential.push(book.name);
            }
        }
        setBooks(books);
        setPotential(potential);
        setAllBooks(books);
    }

    function selectDivision(item: string): void {
        selected.division = item;

        setBooks(allDivisions!!.find(
            (div: any) => div.name === item
        ).books);

        const testament = testaments.find((test: any) => test.divisions.some((div: any) => div.name == item));
        selectTestament(testament.name);
    }

    function selectBook(item: string, disabled?: boolean): void {
        if (disabled) return;

        selected.book = item;

        const chapters = [];
        const numChapters = allBooks!!.find((book: any) => book.name === item).chapters;
        for (let i = 1; i <= numChapters; i++) chapters.push({ name: i.toString() });

        setMaxChapter(numChapters);
        setHasBook(true);
        setChapter("1");

        setChapters(chapters);
        selected.chapter = '1';

        const division = allDivisions.find((div: any) => div.books.some((book: any) => book.name == item));
        selectDivision(division.name);
    }

    function selectChapter(item: string): void {
        setChapter(item);
        selected.chapter = item;
    }

    function addGuess(closeness: any) {
        const updatedGuesses = [
            ...guesses,
            {
                book: selected.book,
                chapter: selected.chapter,
                closeness
            }
        ]

        setGuesses(updatedGuesses);

        if (selected.book == passage.book) {
            setBook(passage.book);
            setBookFound(<CheckIcon className="text-lg text-green-200" />);
        }
        if (selected.chapter == passage.chapter) {
            setChapter(passage.chapter);
            setChapterFound(<CheckIcon className="text-lg text-green-200" />);
        }

        if (selected.testament == passage.testament) {
            setTestamentFound(<CheckIcon className="text-lg text-green-200" />);
        }
        if (selected.division == passage.division) {
            setDivisionFound(<CheckIcon className="text-lg text-green-200" />);
        }

        const won = (closeness.distance == 0);
        const limitReached = (updatedGuesses.length == guessLimit);
        if (won || limitReached) {
            setPlaying(false);
            setResults(<Results guesses={updatedGuesses} found={[testamentFound, divisionFound, bookFound, chapterFound]} date={today}/>);
            if (limitReached) {
                setStars(0);
            } else setStars(5 + 1 - updatedGuesses.length);

            if (won) {
                setResult(`${'⭐'.repeat(5 + 1 - updatedGuesses.length)}
https://bible.game
${moment(new CalendarDate(parseInt(today.split('-')[0]), parseInt(today.split('-')[1]) - 1, parseInt(today.split('-')[2]))).format('Do MMMM YYYY')}`);

            } else {
                const bestGuess: any = guesses.reduce(function(prev: any, current: any) {
                    if (+current.closeness.percentage > +prev.closeness.percentage) return current
                    else return prev;
                }).closeness;

                setResult(`📖 ${Intl.NumberFormat("en", { notation: "compact" }).format(bestGuess.distance)}
https://bible.game
${moment(new CalendarDate(parseInt(today.split('-')[0]), parseInt(today.split('-')[1]) - 1, parseInt(today.split('-')[2]))).format('Do MMMM YYYY')}`);

            }
        }
    }

    // fixme :: behaviour not correct
    function clearSelection(): void {
        selected.testament = '';
        selected.division = '';
        selected.book = '';
        selected.chapter = '';
    }

    function openReading() {
        setReading(true);

        onOpen();
    }

    function changeDate(date: string): void {
        setToday(date!);
        setDate(parseDate(moment(date).format('YYYY-MM-DD').toString()));

        setPlaying(true);
        setTestamentFound(false);
        setDivisionFound(false);
        setBookFound(false);
        setChapterFound(false);
        setGuesses([]);
        setResults(<></>);
        setBook('Book?');
        setChapter('Chapter?');

        retrievePassage(date!);
        clearSelection();
    }

    const stylesDateInput = {
        base: ["w-min", "mb-2"],
        selectorButton: ["opacity-85", "text-white", "p-[1.0625rem]", "hover:!bg-[#ffffff14]"],
        inputWrapper: ["dark", "!bg-transparent"],
        input: ["opacity-85", "ml-2", "text-xs"]
    };

    function isExistingGuess() {
        return guesses.map(guess => guess.book+guess.chapter)
            .includes(selected.book+selected.chapter);
    }

    return <main>
        <div><Toaster/></div>
        {reading ? <Text isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => setReading(false)} today={today}
                         passage={passage}/> :
            <>
                <section>
                    <div aria-hidden="true"
                         className="fixed hidden dark:md:block dark:opacity-100 -bottom-[20%] -left-[10%] z-0">
                        <img
                            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/docs-left.png"
                            className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-85 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                            alt="docs left background" data-loaded="true"/>
                    </div>
                    <div aria-hidden="true"
                         className="fixed hidden dark:md:block dark:opacity-75 -top-[40%] -right-[60%] 2xl:-top-[60%] 2xl:-right-[45%] z-0 rotate-12">
                        <img src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/docs-right.png"
                             className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-65 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                             alt="docs right background" data-loaded="true"/>
                    </div>
                </section>
                <section>
                    <div className="ml-6 flex gap-1 items-start justify-between">
                        <div className="flex gap-1 items-start">
                            <Button variant="light"
                                    radius="full"
                                    size="sm"
                                    isIconOnly
                                    onClick={() => changeDate(_.sample(props.dates))}
                                    className="mt-1 text-white hover:!bg-[#ffffff14] opacity-85">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                     stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                                </svg>
                            </Button>
                            <DatePicker
                                classNames={stylesDateInput}
                                defaultValue={date as any}
                                maxValue={parseDate(TODAY(getLocalTimeZone()).toString()) as any}
                                value={date as any}
                                onChange={(value: any) => changeDate(`${value.year}-${value.month}-${value.day}`)}
                                selectorButtonPlacement="start"/>
                        </div>
                        <div className="flex gap-1 mt-[14px] mr-6">
                            <span className="text-xs font-medium opacity-80 mt-[1px]">0</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24" stroke-width="1.5"
                                 stroke="gold" className="size-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                            </svg>
                        </div>
                    </div>
                    <div
                        className={"panel p-4 h-[66px] " + (!playing ? "flex justify-between gap-2 px-6" : "text-center")}>
                        <div className={"opacity-80 " + (!playing ? "ml-2" : "")}>{passage.summary}</div>
                        <Chip size="sm"
                              variant="solid"
                              classNames={{
                                  base: `opacity-90 bg-gradient-to-br from-green-100 to-green-300 border border-white/50 h-7 mt-0.5 ${playing ? "hidden" : ""}`,
                                  content: "text-black font-medium px-2 py-1 tracking-wide text-center text-[11px]"
                              }}>
                            {passage.book + " " + passage.chapter}</Chip>
                    </div>
                </section>
                <section className="mt-6 flex justify-center">
                    <Display select={selectBook} bookFound={bookFound} divFound={divisionFound} testFound={testamentFound} passage={passage}/>
                </section>
                {
                    playing ? <section className="panel flex justify-between mt-4">
                            <Autocomplete
                                className="flex-1 text-sm border-r-1 border-[#ffffff40] rounded-l-full pl-4 pr-2 py-1 w-[13.33rem]"
                                inputProps={{
                                    classNames: {
                                        inputWrapper: "border-0",
                                        label: "!text-[#ffffff66]",
                                    }
                                }}
                                classNames={{
                                    selectorButton: "text-white opacity-40"
                                }}
                                defaultItems={books}
                                isReadOnly={!!bookFound}
                                startContent={bookFound}
                                selectedKey={selected.book}
                                label="Book"
                                onClear={() => clearSelection()}
                                onSelectionChange={(key: any) => {
                                    selectBook(key)
                                }}
                                variant="bordered">
                                {(item: any) =>
                                    <AutocompleteItem className="text-black text-sm"
                                                      key={item.name}>{item.name}</AutocompleteItem>}
                            </Autocomplete>
                            <NumberInput
                                classNames={{
                                    base: "flex-1 text-sm border-r-1 border-[#ffffff40] px-2 pr-2 py-1 !opacity-100",
                                    inputWrapper: "border-0",
                                    label: "!text-[#ffffff66]",
                                    stepperButton: "text-white opacity-40"
                                }}
                                value={hasBook ? parseInt(chapter) : undefined}
                                maxValue={hasBook ? maxChapter : undefined}
                                onChange={(e: any) => selectChapter(e)}
                                minValue={1}
                                label="Chapter"
                                isDisabled={!hasBook}
                                hideStepper={!hasBook}
                                variant="bordered"
                                className="w-[13.33rem]"
                                endContent={!hasBook ? undefined :
                                    <div
                                        className={"w-full text-left opacity-50 relative right-[3rem]"}>/ {maxChapter} </div>
                                }
                            />
                                    <Button
                                        className="border-0 flex-1 text-white h-[66px] text-sm rounded-l-none rounded-r-full w-[13.33rem] -ml-[14px]"
                                        variant="bordered"
                                        onClick={() => {
                                            if (isExistingGuess()) toast.error("You have already guessed this!")
                                            else {
                                                guessAction(today, selected.book, selected.chapter).then((closeness: any) => {
                                                    addGuess(closeness)
                                                })
                                            }
                                        }}>Guess</Button>
                        </section> :
                        <section className="panel flex justify-between mt-4 items-center">
                            <div className="w-[13.33rem] flex justify-center gap-0.5 mr-[3px]">
                                {[...Array(stars)].map((i: any) =>
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24"
                                         stroke-width="1.5"
                                         stroke="gold" className="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                                    </svg>
                                )}
                                {[...Array(5 - stars)].map((i: any) =>
                                    <div className="opacity-20" key={i}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="#D9D9D9" viewBox="0 0 24 24"
                                             stroke-width="1.5"
                                             stroke="#D9D9D9" className="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <Button
                                className="border-0 flex-1 text-white h-[66px] text-sm rounded-none border-[#ffffff40] border-x-1 w-[13.33rem]"
                                variant="bordered"
                                onClick={() => navigator.clipboard.writeText(result)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.25} stroke="currentColor" className="size-4">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
                                </svg>
                                Share Result</Button>
                            <Button
                                className="border-0 flex-1 text-white h-[66px] text-sm rounded-l-none rounded-r-full w-[13.33rem]"
                                variant="bordered"
                                onClick={() => openReading()}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.25} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                                </svg>
                                Daily Reading</Button>
                        </section>
                }
                <section className="px-4 flex justify-center flex-wrap gap-4 mt-4">
                    {guesses.map((guess: any) => <Guess book={guess.book} key={guess.book + guess.chapter}
                                                        chapter={guess.chapter}
                                                        closeness={guess.closeness}/>)}
                </section>
            </>
        }
    </main>
}


export default Game;