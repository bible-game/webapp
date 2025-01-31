"use client"

import React, {useEffect} from "react";
import styles from "./Game.module.sass"
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@nextui-org/react";
import moment from "moment";
import Guess from "@/app/game/guess/Guess";
import guess from "@/app/game/guess/Guess";
import {guessAction} from "@/app/game/guess-action";

const Game = (props: any) => {
    const today = moment(new Date()).format('YYYY-MM-DD');

    useEffect(() => {
        if (!passage.book) { // fixme :: hack
            fetch(`${process.env.passageService}/daily/${today}`, { method: "GET" })
                .then((response) => {
                    response.json().then((data) => setPassage(data));
                });
        }
    })

    const [passage, setPassage] = React.useState({} as any); // question :: apply type?
    const [guesses, setGuesses] = React.useState([] as any[]); // question :: apply type?
    const [testaments] = React.useState(props.bible.testaments);
    const [divisions, setDivisions] = React.useState([] as any[]);
    const [books, setBooks] = React.useState([] as any);
    const [chapters, setChapters] = React.useState([] as any);
    const [selected] = React.useState({} as {testament: string, division: string, book: string, chapter: string});

    function selectTestament(item: string): void {
        selected.testament = item;
        setDivisions(testaments.find(
            (test: any) => test.name === item
        ).divisions);
    }

    function selectDivision(item: string): void {
        selected.division = item;

        setBooks(divisions!!.find(
            (div: any) => div.name === item
        ).books);
    }

    function selectBook(item: string): void {
        selected.book = item;

        const chapters = [];
        const numChapters = books!!.find((book: any) => book.name === item).chapters;
        for (let i = 1; i <= numChapters; i++) chapters.push({ name: i.toString() });

        setChapters(chapters);
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
    }

    return <main>
        <section>
            <h1>{today}</h1>
            <div className="panel"><p>{passage.summary}</p></div>
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
                onSelectionChange={(key: any) => { selectTestament(key) }}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black" key={item.name}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="flex-1"
                inputProps={{classNames: {inputWrapper: "border"}}}
                defaultItems={divisions}
                label="Division"
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
                onSelectionChange={(key: any) => { selectBook(key) }}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black" key={item.name}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="flex-1"
                inputProps={{classNames: {inputWrapper: "border"}}}
                defaultItems={chapters}
                onSelectionChange={(key: any) => { selectChapter(key) }}
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