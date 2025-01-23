"use client"

import React from "react";
import styles from "./Game.module.sass"
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import {Button, useDisclosure} from "@nextui-org/react";
import { Pagination } from "@heroui/pagination";
import { guessAction } from "@/app/game/guess-action";
import Guess from "@/app/game/guess/Guess";
import Passage from "@/app/game/passage/Passage";
import Results from "@/app/game/results/Results";

const Game = (props: any) => {
    const [page, setPage] = React.useState(1);
    const [book, setBook] = React.useState('Book');
    const [chapter, setChapter] = React.useState('Chapter');
    const [chapters, setChapters] = React.useState([]);
    const [bookTitle, setBookTitle] = React.useState('Select book');
    const [chapterTitle, setChapterTitle] = React.useState('Select chapter');
    const [response, setResponse] = React.useState('Select book');
    const [guesses, setGuesses] = React.useState([] as any[]);
    const [attempts, setAttempts] = React.useState([{}, {}, {}]);
    const [readonly, setReadonly] = React.useState(false);
    const [results, setResults] = React.useState(<section></section>);

    const bible: any[] = props.bible;

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    return <main>
        <section id="passage" onClick={onOpen} className="cursor-pointer">
            <Passage isOpen={isOpen} onOpenChange={onOpenChange} today={props.today} passage={props.passage}/>
            <h1>{props.today}</h1>
            <div className="panel">
                <p>{props.pages.get(page)}</p>
                <Pagination id={styles.pagination} size="sm" initialPage={page} total={props.pages.size}
                            onChange={(page: number) => setPage(page)}/>
            </div>
        </section>
        {results}
        <section id={styles.selection} className="flex justify-center">
            <Autocomplete
                className="max-w-sm"
                isReadOnly={readonly}
                defaultItems={bible}
                label={bookTitle}
                onSelectionChange={(key: any) => {
                    const book = bible.find(b => b.book === key);
                    setChapters(book?.chapters);
                    setChapter('Chapter')
                    setBook(key);
                    setResponse('Select chapter');
                    setBookTitle('The Law, Old Testament');
                }}
                variant="bordered">
                {(item: any) => <AutocompleteItem className="text-black" key={item.book}>{item.book}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="max-w-sm"
                isReadOnly={readonly}
                defaultItems={chapters}
                label={chapterTitle}
                onSelectionChange={(key: any) => {
                    setChapter(key);
                    setChapterTitle('Chapter ' + (chapters as any).find((c: any) => c.title === key).chapter)
                }}
                variant="bordered">
                {(item: any) => <AutocompleteItem className="text-black"
                                                  key={item.title}>{item.title}</AutocompleteItem>}
            </Autocomplete>
            <Button
                disabled={readonly}
                id={styles.guess}
                onClick={() => {
                    guessAction(book, chapter)
                        .then((closeness: any) => {
                            closeness += '%';
                            setGuesses([...guesses, {book, chapter, closeness}])
                            const att = [];
                            for (let i = 3; i > guesses.length + 1; i--) {
                                att.push({})
                            }
                            setAttempts(att)
                            if (closeness == '100%') {
                                setReadonly(true);
                                setResults(<Results guesses={[...guesses, {book, chapter, closeness}]} book={props.book} chapter={props.chapter} title={props.title}/>)
                            } else if (guesses.length == 3 - 1) {
                                setReadonly(true);
                                setResults(<Results guesses={guesses} book={props.book} chapter={props.chapter} title={props.title}/>)
                            }
                        })
                }}
                variant="bordered">
                Guess
            </Button>
        </section>
        <section className="mt-8">
            {guesses.map((guess: any) => <Guess book={guess.book} title={guess.chapter} closeness={guess.closeness}/>)}
        </section>
        <section>
            {attempts.map((attempt: any) => <Guess book={attempt.book} title={attempt.chapter}
                                                   closeness={attempt.closeness}/>)}
        </section>
    </main>
}

export default Game;