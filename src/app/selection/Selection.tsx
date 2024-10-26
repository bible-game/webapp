"use client"

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import React from "react";
import styles from "./Selection.module.sass"

// @ts-ignore
const Selection = () => {
    const [book, setBook] = React.useState('Book');

    let selectedChapter = 'Chapter';
    const bible: any = {
        "genesis": { label: "Genesis", chapters: 50 },
        "exodus": { label: "Exodus", chapters: 40 },
        "leviticus": { label: "Leviticus", chapters: 27 },
        "numbers": { label: "Numbers", chapters: 36 },
        "deuteronomy": { label: "Deuteronomy", chapters: 34 }
    };

    return (
        <section id={styles.selection}>
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="bordered">{book}</Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Dynamic Actions"
                    items={bible.keys}
                    onAction={(key: string) => setBook(bible[key].label)}
                    className="p-3"
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
                    }}
                >
                    {(item) => (
                        <DropdownItem>{bible[item].label}</DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="bordered">{selectedChapter}</Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Dynamic Actions"
                    items={bible}
                    className="p-3"
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
                    }}
                >
                    {(item) => (
                        <DropdownItem key={item.key}>{item.label}</DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        </section>
    )
}

export default Selection;