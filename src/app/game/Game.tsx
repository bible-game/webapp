"use client"

import React, { useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import {Button, Chip, useDisclosure} from "@nextui-org/react";
import moment from "moment";
import Guess from "@/app/game/guess/Guess";
import Text from "@/app/game/text/Text";
import { guessAction } from "@/app/game/guess-action";
import { CheckIcon } from "@heroui/shared-icons";
import { DatePicker } from "@heroui/date-picker";
import Results from "@/app/game/results/Results";
import { getLocalTimeZone, today as TODAY, CalendarDate } from "@internationalized/date";
import _ from "lodash";
import { toast, Toaster } from "react-hot-toast";

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
    const [chapters, setChapters] = React.useState([] as any);
    const [selected, setSelected] = React.useState({} as {testament: string, division: string, book: string, chapter: string});
    const [book, setBook] = React.useState('Book?');
    const [chapter, setChapter] = React.useState('Chapter?');

    const [testamentFound, setTestamentFound] = React.useState(false as any);
    const [divisionFound, setDivisionFound] = React.useState(false as any);
    const [bookFound, setBookFound] = React.useState(false as any);
    const [chapterFound, setChapterFound] = React.useState(false as any);

    const [playing, setPlaying] = React.useState(true);
    const [results, setResults] = React.useState(<></>);
    const [reading, setReading] = React.useState(false);

    const [dates, setDates] = React.useState([] as any[]);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
    }

    function flattenBooks() {
        const books = [];
        for (const div of divisions) {
            for (const book of div.books) books.push(book);
        }
        setBooks(books);
    }

    function selectDivision(item: string): void {
        selected.division = item;

        setBooks(divisions!!.find(
            (div: any) => div.name === item
        ).books);

        const testament = testaments.find((test: any) => test.divisions.some((div: any) => div.name == item));
        selectTestament(testament.name);
    }

    function selectBook(item: string): void {
        selected.book = item;

        const chapters = [];
        const numChapters = books!!.find((book: any) => book.name === item).chapters;
        for (let i = 1; i <= numChapters; i++) chapters.push({ name: i.toString() });

        setChapters(chapters);

        const division = divisions.find((div: any) => div.books.some((book: any) => book.name == item));
        selectDivision(division.name);
    }

    function selectChapter(item: string): void {
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
                         className="fixed hidden dark:md:block dark:opacity-100 -bottom-[20%] -left-[20%] z-0">
                        <img
                            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/docs-left.png"
                            className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-65 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                            alt="docs left background" data-loaded="true"/>
                    </div>
                    <div aria-hidden="true"
                         className="fixed hidden dark:md:block dark:opacity-75 -top-[50%] -right-[60%] 2xl:-top-[60%] 2xl:-right-[45%] z-0 rotate-12">
                        <img src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/docs-right.png"
                             className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-55 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                             alt="docs right background" data-loaded="true"/>
                    </div>
                </section>
                <section>
                    <div className="ml-6 flex gap-1 items-start">
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
                            defaultValue={TODAY(getLocalTimeZone())}
                            maxValue={TODAY(getLocalTimeZone())}
                            dateInputClassNames={stylesDateInput}
                            value={new CalendarDate(parseInt(today.split('-')[0]), parseInt(today.split('-')[1]), parseInt(today.split('-')[2]))}
                            onChange={(value: any) => changeDate(`${value.year}-${value.month}-${value.day}`)}
                            selectorButtonPlacement="start"/>
                    </div>
                    <div className="panel text-center">
                        <div className="text-[1rem] opacity-85">{passage.summary}</div>
                    </div>
                </section>
                <section className="flex justify-between gap-4 mt-4">
                    {guesses.map((guess: any) => <Guess book={guess.book} key={guess.book+guess.chapter} chapter={guess.chapter}
                                                        closeness={guess.closeness}/>)}
                    {[...Array(5 - guesses.length).keys()].map(x => x++).map((x: number) => <Guess key={x}/>)}
                </section>
                <section className="panel flex justify-between gap-4 mt-4">
                    <Autocomplete
                        className="flex-1"
                        inputProps={{classNames: {inputWrapper: "border"}}}
                        defaultItems={testaments}
                        isReadOnly={!!testamentFound}
                        startContent={testamentFound}
                        label="Testament"
                        onClear={() => clearSelection()}
                        onSelectionChange={(key: any) => {
                            selectTestament(key)
                        }}
                        selectedKey={selected.testament}
                        variant="bordered">
                        {(item: any) =>
                            <AutocompleteItem className="text-black" key={item.name}>{item.name}</AutocompleteItem>}
                    </Autocomplete>
                    <Autocomplete
                        className="flex-1 text-sm"
                        inputProps={{classNames: {inputWrapper: "border"}}}
                        defaultItems={divisions}
                        isReadOnly={!!divisionFound}
                        startContent={divisionFound}
                        label="Division"
                        selectedKey={selected.division}
                        onClear={() => clearSelection()}
                        onSelectionChange={(key: any) => {
                            selectDivision(key)
                        }}
                        variant="bordered">
                        {(item: any) =>
                            <AutocompleteItem className="text-black text-sm"
                                              key={item.name}>{item.name}</AutocompleteItem>}
                    </Autocomplete>
                    <Autocomplete
                        className="flex-1 text-sm"
                        inputProps={{classNames: {inputWrapper: "border"}}}
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
                    <Autocomplete
                        className="flex-1 text-sm"
                        inputProps={{classNames: {inputWrapper: "border"}}}
                        defaultItems={chapters}
                        isReadOnly={!!chapterFound}
                        startContent={chapterFound}
                        onClear={() => clearSelection()}
                        onSelectionChange={(key: any) => {
                            selectChapter(key)
                        }}
                        listboxProps={{
                            emptyContent: "Select a book",
                        }}
                        label="Chapter"
                        variant="bordered">
                        {(item: any) =>
                            <AutocompleteItem className="text-black text-sm"
                                              key={item.name}>{item.name}</AutocompleteItem>}
                    </Autocomplete>
                    {
                        playing ?
                            <Button className="border flex-1 text-white h-[3.5rem] p-0 text-sm" variant="bordered"
                                    onClick={() => {
                                        if (isExistingGuess()) toast.error("You have already guessed this!")
                                        else {
                                            guessAction(today, selected.book, selected.chapter).then((closeness: any) => {
                                                addGuess(closeness)
                                            })
                                        }
                                    }}>Guess</Button> :
                            <Button className="border flex-1 text-white h-[3.5rem] p-0 text-sm" variant="bordered"
                                    onClick={() => openReading()}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.25} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                                </svg>
                                Reading</Button>
                    }
                </section>
            </>
        }
    </main>
}


export default Game;