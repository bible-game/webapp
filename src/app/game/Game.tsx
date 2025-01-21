"use client"

import React from "react";
import styles from "./Game.module.sass"
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@nextui-org/react";
import { Pagination } from "@heroui/pagination";

const Game = (props: any) => {
    const [page, setPage] = React.useState(1);
    const [book, setBook] = React.useState('Book');
    const [chapter, setChapter] = React.useState('Chapter');
    const [chapters, setChapters] = React.useState([]);
    const [bookTitle, setBookTitle] = React.useState('Select book');
    const [chapterTitle, setChapterTitle] = React.useState('Select chapter');
    const [response, setResponse] = React.useState('Select book');

    const bible: any[] = props.bible;

    function check(answer: any): void {
        if (`${props.book}${props.title}`.toLocaleLowerCase() == answer.toLocaleLowerCase()) {
            setResponse('Correct 🎉');
        } else {
            setResponse('Incorrect');
        }
    }

    return <main>
        <section id="passage">
            <h1>{props.today}</h1>
            <div className="panel">
                <p>{props.passage.get(page)}</p>
                <Pagination id={styles.pagination} size="sm" initialPage={page} total={props.passage.size} onChange={(page: number) => setPage(page)}/>
            </div>
        </section>
        <section id={styles.selection} className="flex justify-center">
        <Autocomplete
                className="max-w-sm"
                defaultItems={bible}
                label={bookTitle}
                onSelectionChange={(key: any) => {
                    const book = bible.find(b => b.book === key);
                    setChapters(book?.chapters);
                    setChapter('Chapter')
                    setBook(key);
                    setResponse('Select chapter');
                    setBookTitle('The Law, Old Testament')
                }}
                variant="bordered">
                {(item: any) => <AutocompleteItem key={item.book}>{item.book}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete
                className="max-w-sm"
                defaultItems={chapters}
                label={chapterTitle}
                onSelectionChange={(key: any) => { setChapter(key); setChapterTitle('Chapter ' + (chapters as any).find((c: any) => c.title === key).chapter) }}
                variant="bordered">
                {(item: any) => <AutocompleteItem key={item.title}>{item.title}</AutocompleteItem>}
            </Autocomplete>
            <Button
                id={styles.guess}
                onClick={() => { check(book+chapter) }}
                variant="bordered">
                Guess
            </Button>
        </section>
        <section id={styles.answer} className="flex justify-center mt-8">
            <p>{response}</p>
        </section>
    </main>
}

export default Game;