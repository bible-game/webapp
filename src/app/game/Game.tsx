"use client"

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import React from "react";
import styles from "./Game.module.sass"

// @ts-ignore
const Game = (props) => {
    const [book, setBook] = React.useState('Book');
    const [chapter, setChapter] = React.useState('Chapter');
    const [chapters, setChapters] = React.useState([]);
    const [response, setResponse] = React.useState('Select book');

    const bible: any[] = [
        { key: "genesis", label: "Genesis", chapters: 50 },
        { key: "exodus", label: "Exodus", chapters: 40 },
        { key: "leviticus", label: "Leviticus", chapters: 27 },
        { key: "numbers", label: "Numbers", chapters: 36 },
        { key: "deuteronomy", label: "Deuteronomy", chapters: 34 },

        { key: "mark", label: "Mark", chapters: 16 },
    ];

    function populateChapters(total: number): void {
        const chapters = [];
        for (let i = 1; i <= total; i++)
            chapters.push({ key: i, label: i.toString() });
        setChapters(chapters);
    }

    function check(answer): void {
        if (props.book+props.chapter == answer) {
            setResponse('Correct 🎉');
        } else {
            setResponse('Incorrect');
        }
    }

    return (
        <main>
            <section id={styles.selection} className="flex justify-center">
                <Dropdown>
                    <DropdownTrigger>
                        <Button variant="bordered">{book}</Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Dynamic Actions"
                        items={bible}
                        onAction={(key: string) => {
                            const book = bible.find(b => b.key === key);
                            populateChapters(book.chapters);
                            setChapter('Chapter')
                            setBook(book.label);
                            setResponse('Select chapter');
                        }}
                        className="mt-2 p-3 max-h-[50vh] overflow-y-auto"
                        itemClasses={{
                            base: [
                                "rounded-md",
                                "text-default-500",
                                "transition-opacity",
                                "data-[hover=true]:text-foreground",
                                "data-[hover=true]:bg-default-100",
                                "dark:data-[hover=true]:bg-default-50",
                                "data-[selectable=true]:focus:bg-default-50",
                                "data-[pressed=true]:opacity-70",
                                "data-[focus-visible=true]:ring-default-500",
                            ]
                        }}>
                        {(item) => (
                            <DropdownItem key={item.key}>{item.label}</DropdownItem>
                        )}
                    </DropdownMenu>
                </Dropdown>
                <Dropdown>
                    <DropdownTrigger>
                        <Button variant="bordered">{chapter}</Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Dynamic Actions"
                        items={chapters}
                        onAction={async (key: string) => {
                            setChapter(key);
                            check(book+key)
                        }}
                        className="mt-2 p-3 max-h-[50vh] overflow-y-auto"
                        itemClasses={{
                            base: [
                                "rounded-md",
                                "text-default-500",
                                "transition-opacity",
                                "data-[hover=true]:text-foreground",
                                "data-[hover=true]:bg-default-100",
                                "dark:data-[hover=true]:bg-default-50",
                                "data-[selectable=true]:focus:bg-default-50",
                                "data-[pressed=true]:opacity-70",
                                "data-[focus-visible=true]:ring-default-500",
                            ]
                        }}>
                        {(item) => (
                            <DropdownItem key={item.key}>{item.label}</DropdownItem>
                        )}
                    </DropdownMenu>
                </Dropdown>
            </section>
            <section id="passage">
                <h1>{props.today}</h1>
                <p>{props.passage}</p>
            </section>
            <section id={styles.answer} className="flex justify-center mt-8">
                <p>{response}</p>
            </section>
        </main>
    )
}

export default Game;