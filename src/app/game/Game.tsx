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
import { getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";

const Game = (props: any) => {
    const guessLimit = 5;
    const today = moment(new Date()).format('YYYY-MM-DD');

    useEffect(() => {
        if (!passage.book) { // fixme :: hack
            flattenDivisions();
            flattenBooks();

            fetch(`${process.env.passageService}/daily/${today}`, { method: "GET" })
                .then((response) => {
                    response.json().then((data) => {
                        data.division = divisions.find((div: any) => div.books.some((book: any) => book.name == data.book)).name;
                        data.testament = props.bible.testaments.find((test: any) => test.divisions.some((div: any) => div.name == data.division)).name;
                        setPassage(data);
                    });
                });

            fetch(`${process.env.passageService}/daily/history`, { method: "GET" })
                .then((response) => {
                    response.json().then((data) => {
                        // Remove T...
                        setDates(data);
                    });
                });
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
            setResults(<Results guesses={updatedGuesses} found={[testamentFound, divisionFound, bookFound, chapterFound]}/>);
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

    function closeReading() {
        setReading(false);
    }

    const stylesDateInput = {
        base: ["dark", "w-max-[20rem]", "mb-2"],
        selectorButton: ["text-white"],
        inputWrapper: ["!bg-transparent"],
    };

    return <main>
        { reading ? <Text isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => setReading(false)} today={today} passage={passage}/> :
            <>
                <section>
                    <div aria-hidden="true"
                         className="fixed hidden dark:md:block dark:opacity-100 -bottom-[30%] -left-[30%] z-0">
                        <img
                            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/docs-left.png"
                            className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-55 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                            alt="docs left background" data-loaded="true"/>
                    </div>
                    <div aria-hidden="true"
                         className="fixed hidden dark:md:block dark:opacity-70 -top-[50%] -right-[60%] 2xl:-top-[60%] 2xl:-right-[45%] z-0 rotate-12">
                        <img src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/docs-right.png"
                             className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-55 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                             alt="docs right background" data-loaded="true"/>
                    </div>
                </section>
                <section>
                    <DatePicker
                        classNames={stylesDateInput}
                        defaultValue={TODAY(getLocalTimeZone())}
                        maxValue={TODAY(getLocalTimeZone())}
                        dateInputClassNames={stylesDateInput}
                        selectorButtonPlacement="start" />
                    <div className="panel flex justify-between">
                        <div className="text-[1rem]">{passage.summary}</div>
                        {results}
                        <div>
                            <Chip size="md"
                                  className="mr-4"
                                  variant="solid"
                                  classNames={!playing && !bookFound ?
                                      {
                                          base: "bg-gradient-to-br from-blue-50 to-blue-300 border border-white/50",
                                          content: "text-black font-medium p-1 tracking-wide w-[6rem] text-center",
                                      } :
                                      bookFound ?
                                          {
                                              base: "bg-gradient-to-br from-green-50 to-green-300 border border-white/50",
                                              content: "text-black font-medium p-1 tracking-wide w-[8rem] text-center"
                                          } :
                                          {base: "bg-clear", content: "bg-clear w-[4rem] text-center p-1 text-white"}}>
                                {playing ? book : passage.book}</Chip>
                            <Chip size="md"
                                  variant="solid"
                                  classNames={!playing && !chapterFound ?
                                      {
                                          base: "bg-gradient-to-br from-blue-50 to-blue-300 border border-white/50",
                                          content: "text-black font-medium p-1 tracking-wide w-[6rem] text-center",
                                      } :
                                      chapterFound ?
                                          {
                                              base: "bg-gradient-to-br from-green-50 to-green-300 border border-white/50",
                                              content: "text-black font-medium p-1 tracking-wide w-[6rem] text-center",
                                          } :
                                          {base: "bg-clear", content: "bg-clear w-[6rem] text-center p-1 text-white",}}>
                                {playing ? chapter : passage.chapter}</Chip>
                        </div>
                    </div>
                </section>
                <section className="flex justify-between gap-4 mt-4">
                    {guesses.map((guess: any) => <Guess book={guess.book} chapter={guess.chapter}
                                                        closeness={guess.closeness}/>)}
                    {[...Array(5 - guesses.length).keys()].map(x => x++).map(() => <Guess/>)}
                </section>
                <section className="flex justify-between gap-4 mt-4">
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
                                        guessAction(today, selected.book, selected.chapter).then((closeness: any) => {
                                            addGuess(closeness)
                                        })
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