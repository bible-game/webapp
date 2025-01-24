"use client"

import React from "react";
import styles from "./Game.module.sass"
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import {Button, useDisclosure} from "@nextui-org/react";
import { guessAction } from "@/app/game/guess-action";
import Guess from "@/app/game/guess/Guess";
import {passageAction} from "@/app/game/passage-action";

const Game = (props: any) => {
    const [today, setToday] = React.useState(moment(new Date()).format('dddd Do MMMM YYYY'))

    const [passage, setPassage] = React.useState({});
    const [book, setBook] = React.useState('Book');
    const [chapter, setChapter] = React.useState('Chapter');
    const [chapters, setChapters] = React.useState([]);
    const [bookTitle, setBookTitle] = React.useState('Select book');
    const [chapterTitle, setChapterTitle] = React.useState('Select chapter');
    const [guesses, setGuesses] = React.useState([] as any[]);
    const [attempts, setAttempts] = React.useState([{}, {}, {}]);
    const [readonly, setReadonly] = React.useState(false);
    const [results, setResults] = React.useState(<></>);
    const [playing, setPlaying] = React.useState(true);

    passageAction().then((passage) => setPassage(passage));

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    function openPassage() {
        setReadonly(true);
        onOpen()
    }

    function closePassage() {
        if (playing) setReadonly(false);
    }

    function selectBook(key: any) {
        const book = props.bible.books.find(b => b.book === key);
        setChapters(book?.chapters);
        setChapter('Chapter')
        setChapterTitle('Select chapter')
        setBook(key);
        setBookTitle('The Law, Old Testament');
    }

    function selectPassage(key: any) {
        setChapter(key);
        setChapterTitle('Chapter ' + (chapters as any).find((c: any) => c.title === key.split(" - ")[1]).chapter)
    }

    function registerGuess(closeness: any) {
        closeness += '%';
        setGuesses([...guesses, {book, chapter, closeness}])
        const att = [];
        for (let i = 3; i > guesses.length + 1; i--) {
            att.push({})
        }
        setAttempts(att)
        if (closeness == '100%') {
            setPlaying(false);
            setReadonly(true);
            setResults(<Results guesses={[...guesses, {book, chapter, closeness}]} book={props.book}
                                chapter={props.chapter} title={props.title} today={today}/>)
        } else if (guesses.length == 3 - 1) {
            setPlaying(false);
            setReadonly(true);
            setResults(<Results guesses={guesses} book={props.book} chapter={props.chapter}
                                title={props.title} today={today}/>)
        }
    }

    return <main>
        <section id="text" onClick={openPassage} className="cursor-pointer">
            <Text isOpen={isOpen} onOpenChange={onOpenChange} onClose={closePassage} today={today} text={passage.text}/>
            <h1>{today}</h1>
            <div className="panel"><p>{text.match(/[\s\S]{1,300}/g)[0]}...</p></div>
        </section>
        {results}
        {readonly ? null :
            <section id={styles.selection} className="flex justify-center mb-12">
            <Autocomplete
                className="max-w-sm"
                inputProps={{classNames: {inputWrapper: "border",}}}
                isReadOnly={readonly}
                defaultItems={props.bible.books}
                label={bookTitle}
                onSelectionChange={(key: any) => { selectBook(key) }}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black" key={item.book}>{item.book}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="max-w-sm"
                inputProps={{classNames: {inputWrapper: "border",}}}
                isReadOnly={readonly}
                defaultItems={chapters}
                label={chapterTitle}
                onSelectionChange={(key: any) => { selectPassage(key) }}
                variant="bordered">
                {(item: any) =>
                    <AutocompleteItem className="text-black" key={item.chapter + " - " + item.title}>{item.chapter + " - " + item.title}</AutocompleteItem>}
            </Autocomplete>
            <Button
                disabled={readonly}
                id={styles.guess}
                onClick={() => { guessAction(book, '', chapter).then((closeness: any) => { registerGuess(closeness) }) }}
                className="border"
                variant="bordered">
                Guess
            </Button>
        </section> }
        <section className="mt-8">
            {guesses.map((guess: any) =>
                <Guess book={guess.book} title={guess.chapter} closeness={guess.closeness}/>)}
        </section>
        <section className="opacity-25">
            {attempts.map((attempt: any) =>
                <Guess book={attempt.book} title={attempt.chapter} closeness={attempt.closeness}/>)}
        </section>
    </main>
}


export default Game;