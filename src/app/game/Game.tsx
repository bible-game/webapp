"use client"

import React, { useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@nextui-org/react";
import moment from "moment";
import Guess from "@/app/game/guess/Guess";
import { guessAction } from "@/app/game/guess-action";

const Game = (props: any) => {
    const today = moment(new Date()).format('YYYY-MM-DD');

    useEffect(() => {
        if (!passage.book) { // fixme :: hack
            fetch(`${process.env.passageService}/daily/${today}`, { method: "GET" })
                .then((response) => {
                    response.json().then((data) => setPassage(data));
                });

            flattenDivisions();
            flattenBooks();
        }
    })

    const [passage, setPassage] = React.useState({} as any); // question :: apply type?
    const [guesses, setGuesses] = React.useState([] as any[]); // question :: apply type?
    const [testaments, setTestaments] = React.useState(props.bible.testaments);
    const [divisions, setDivisions] = React.useState([] as any[]);
    const [books, setBooks] = React.useState([] as any[]);
    const [chapters, setChapters] = React.useState([] as any);
    const [selected, setSelected] = React.useState({} as {testament: string, division: string, book: string, chapter: string});
    const [book, setBook] = React.useState(<span className="mr-4 p-2 w-[8rem]">Book?</span>);
    const [chapter, setChapter] = React.useState(<span className="p-2 w-[8rem]">Chapter?</span>);

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
            closeness: `${closeness}%`
        }

        setGuesses([...guesses, guess]);

        if (selected.book == passage.book) {
            setBook(<span className="mr-4 p-2 bg-green-200 text-green-950 rounded-lg w-[8rem]">{passage.book}</span>);
        }
        if (selected.chapter == passage.chapter) {
            setChapter(<span className="p-2 bg-green-200 text-green-950 rounded-lg w-[8rem]">{passage.chapter}</span>);
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
                <div>{passage.summary}</div>
                <div>{book}<span>{chapter}</span></div>
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
                label="Testament"
                onClear={() => clearSelection()}
                onSelectionChange={(key: any) => { selectTestament(key) }}
                selectedKey={selected.testament}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black" key={item.name}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="flex-1"
                inputProps={{classNames: {inputWrapper: "border"}}}
                defaultItems={divisions}
                selectedKey={selected.division}
                label="Division"
                onClear={() => clearSelection()}
                onSelectionChange={(key: any) => { selectDivision(key) }}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black" key={item.name}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="flex-1"
                inputProps={{classNames: {inputWrapper: "border"}}}
                defaultItems={books}
                label="Book"
                onClear={() => clearSelection()}
                onSelectionChange={(key: any) => { selectBook(key) }}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black" key={item.name}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="flex-1"
                inputProps={{classNames: {inputWrapper: "border"}}}
                defaultItems={chapters}
                onClear={() => clearSelection()}
                onSelectionChange={(key: any) => { selectChapter(key) }}
                listboxProps={{
                    emptyContent: "Select a book",
                }}
                label="Chapter"
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black" key={item.name}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Button
                className="border flex-1 text-white h-[3.5rem] p-0"
                variant="bordered"
                onClick={() => {
                    guessAction(today, selected.book, selected.chapter).then((closeness: any) => { addGuess(closeness)})
                }}>
                Guess</Button>
        </section>
    </main>
}


export default Game;