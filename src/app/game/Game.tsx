"use client"

import React, { useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button, Chip } from "@nextui-org/react";
import moment from "moment";
import Guess from "@/app/game/guess/Guess";
import { guessAction } from "@/app/game/guess-action";
import { CheckIcon } from "@heroui/shared-icons";

const Game = (props: any) => {
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
                        setPassage(data)
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

    function addGuess(closeness: number) {
        const guess = {
            book: selected.book,
            chapter: selected.chapter,
            closeness: closeness == 100 ? '🎉' : `${closeness}%`
        };

        setGuesses([...guesses, guess]);

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
    }

    // fixme :: behaviour not correct
    function clearSelection(): void {
        selected.testament = '';
        selected.division = '';
        selected.book = '';
        selected.chapter = '';
    }

    return <main>
        <section>
            <h1>{today}</h1>
            <div className="panel flex justify-between">
                <div className="text-[1rem]">{passage.summary}</div>
                <div>
                    <Chip size="md"
                          className="mr-4"
                          classNames={ bookFound ? {
                              base: "bg-gradient-to-br from-green-50 to-green-300 border border-white/50",
                              content: "text-black font-semibold p-1 tracking-wide w-[6rem] text-center",
                          } : {
                              base: "bg-clear",
                              content: "bg-clear w-[6rem] text-center p-1 text-white",
                          }}
                          variant="solid">
                        {book}</Chip>
                    <Chip size="md"
                          classNames={ chapterFound ? {
                              base: "bg-gradient-to-br from-green-50 to-green-300 border border-white/50",
                              content: "text-black font-semibold p-1 tracking-wide w-[6rem] text-center",
                          } : {
                              base: "bg-clear",
                              content: "bg-clear w-[6rem] text-center p-1 text-white",
                          }}
                          variant="solid">{chapter}</Chip>
                </div>
            </div>
        </section>
        <section className="flex justify-between gap-4 mt-4">
            {guesses.map((guess: any) => <Guess book={guess.book} chapter={guess.chapter} closeness={guess.closeness}/>)}
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
                onSelectionChange={(key: any) => { selectTestament(key) }}
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
                onSelectionChange={(key: any) => { selectDivision(key) }}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black text-sm" key={item.name}>{item.name}</AutocompleteItem>}
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
                onSelectionChange={(key: any) => { selectBook(key) }}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black text-sm" key={item.name}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="flex-1 text-sm"
                inputProps={{classNames: {inputWrapper: "border"}}}
                defaultItems={chapters}
                isReadOnly={!!chapterFound}
                startContent={chapterFound}
                onClear={() => clearSelection()}
                onSelectionChange={(key: any) => { selectChapter(key) }}
                listboxProps={{
                    emptyContent: "Select a book",
                }}
                label="Chapter"
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black text-sm" key={item.name}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Button
                className="border flex-1 text-white h-[3.5rem] p-0 text-sm"
                variant="bordered"
                onClick={() => {
                    guessAction(today, selected.book, selected.chapter).then((closeness: any) => { addGuess(closeness)})
                }}>
                Guess</Button>
        </section>
    </main>
}


export default Game;