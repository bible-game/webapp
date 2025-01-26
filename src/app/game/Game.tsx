"use client"

import React, {useEffect} from "react";
import styles from "./Game.module.sass"
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button, useDisclosure } from "@nextui-org/react";
import { guessAction } from "@/app/game/guess-action";
import Guess from "@/app/game/guess/Guess";
import moment from "moment";
import Results from "@/app/game/results/Results";
import Text from "@/app/game/text/Text";

const Game = (props: any) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [passage, setPassage] = React.useState({} as any);
    const [condensed, setCondensed] = React.useState('');
    const [text, setText] = React.useState(<></>);
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

    const today = moment(new Date()).format('dddd Do MMMM YYYY');
    useEffect(() => {
        fetch(`${process.env.passageService}/daily`, {
            method: "GET"
        }).then((response) => {
            response.json().then((data) => {
                setPassage(data);
                setCondensed(data.text.match(/[\s\S]{1,300}/g)[0]);
                setText(
                    <Text isOpen={isOpen} onOpenChange={onOpenChange} onClose={closePassage} today={today} text={data.text}/>
                )
            });
        });
    })

    const openPassage = () => { setReadonly(true); onOpen(); }
    const closePassage = () => { if (playing) setReadonly(false); }

    function selectBook(key: any) {
        const book = props.bible.books.find((b: any) => b.book === key);
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
            setResults(<Results guesses={[...guesses, {book, chapter, closeness}]} book={passage.book}
                                chapter={passage.chapter} title={passage.title} today={today}/>)
        } else if (guesses.length == 3 - 1) {
            setPlaying(false);
            setReadonly(true);
            setResults(<Results guesses={guesses} book={passage.book} chapter={passage.chapter}
                                title={passage.title} today={today}/>)
        }
    }

    return <main>
        <section id="text" onClick={openPassage} className="cursor-pointer">
            {text}
            <h1>{today}</h1>
            <div className="panel"><p>{condensed}...</p></div>
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