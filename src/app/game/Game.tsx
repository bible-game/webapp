"use client"

import React from "react";
import styles from "./Game.module.sass"
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";

// @ts-ignore
const Game = (props) => {
    const [book, setBook] = React.useState('Book');
    const [chapter, setChapter] = React.useState('Chapter');
    const [chapters, setChapters] = React.useState([]);
    const [response, setResponse] = React.useState('Select book');

    const bible: any[] = [
        {
            book: "Isaiah", chapters: [
                {chapter: 1, summary: "1: A rebellious nation", verseStart: 1, verseEnd: 31},
                {chapter: 2, summary: "2: The mountain of the Lord", verseStart: 1, verseEnd: 5},
                {chapter: 2, summary: "2: The year of the Lord", verseStart: 6, verseEnd: 22}
            ]
        },
        {
            book: "Acts", chapters: [
                {chapter: 1, summary: "1: Jesus taken up into heaven", verseStart: 1, verseEnd: 11},
                {chapter: 1, summary: "1: Mathias chosen to replace Judas", verseStart: 12, verseEnd: 26},
            ]
        },
    ]

    function check(answer: any): void {
        console.log(`${props.book}${props.chapter}: ${props.summary}`);
        console.log(answer)
        if (`${props.book}${props.chapter}: ${props.summary}`.toLocaleLowerCase() == answer.toLocaleLowerCase()) {
            setResponse('Correct 🎉');
        } else {
            setResponse('Incorrect');
        }
    }

    return (
        <main>
            <section id="passage">
                <h1>{props.today}</h1>
                <p>{props.passage}</p>
            </section>
            <section id={styles.selection} className="flex justify-center">
                <Autocomplete
                    className="max-w-xs"
                    defaultItems={bible}
                    label="Select book"
                    onSelectionChange={(key: any) => {
                        const book = bible.find(b => b.book === key);
                        setChapters(book?.chapters);
                        setChapter('Chapter')
                        setBook(key);
                        setResponse('Select chapter');
                    }}
                    variant="bordered">
                    {(item: any) => <AutocompleteItem key={item.book}>{item.book}</AutocompleteItem>}
                </Autocomplete>
                <Autocomplete
                    className="max-w-xs"
                    defaultItems={chapters}
                    label="Select chaper"
                    onSelectionChange={(key: any) => {
                        setChapter(key);
                        check(book+key)
                    }}
                    variant="bordered">
                    {(item: any) => <AutocompleteItem key={item.summary}>{item.summary}</AutocompleteItem>}
                </Autocomplete>

                {/*<Dropdown>*/}
                {/*    <DropdownTrigger>*/}
                {/*        <Button variant="bordered">{chapter}</Button>*/}
                {/*    </DropdownTrigger>*/}
                {/*    <DropdownMenu*/}
                {/*        aria-label="Dynamic Actions"*/}
                {/*        items={chapters}*/}
                {/*        onAction={async (key: any) => {*/}
                {/*            setChapter(key);*/}
                {/*            check(book+key)*/}
                {/*        }}*/}
                {/*        className="mt-2 p-3 max-h-[50vh] overflow-y-auto"*/}
                {/*        itemClasses={{*/}
                {/*            base: [*/}
                {/*                "rounded-md",*/}
                {/*                "text-default-500",*/}
                {/*                "transition-opacity",*/}
                {/*                "data-[hover=true]:text-foreground",*/}
                {/*                "data-[hover=true]:bg-default-100",*/}
                {/*                "dark:data-[hover=true]:bg-default-50",*/}
                {/*                "data-[selectable=true]:focus:bg-default-50",*/}
                {/*                "data-[pressed=true]:opacity-70",*/}
                {/*                "data-[focus-visible=true]:ring-default-500",*/}
                {/*            ]*/}
                {/*        }}>*/}
                {/*        {(item: any) => (*/}
                {/*            <DropdownItem key={item.key}>{item.label}</DropdownItem>*/}
                {/*        )}*/}
                {/*    </DropdownMenu>*/}
                {/*</Dropdown>*/}
            </section>
            <section id={styles.answer} className="flex justify-center mt-8">
                <p>{response}</p>
            </section>
        </main>
    )
}

export default Game;