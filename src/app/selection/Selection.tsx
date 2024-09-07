"use client"

import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import React from "react";

// @ts-ignore
export const Selection = (props) => {
    const bible: any = [
        { key: "genesis", label: "Genesis", books: 50 },
        { key: "exodus", label: "Exodus", books: 40 },
        { key: "leviticus", label: "Leviticus", books: 27 },
        { key: "numbers", label: "Numbers", books: 36 },
        { key: "deuteronomy", label: "Deuteronomy", books: 34 },
        { key: "joshua", label: "Joshua", books: 24 },
        { key: "judges", label: "Judges", books: 21 },
        { key: "ruth", label: "Ruth", books: 4 },
        { key: "1samuel", label: "1 Samuel", books: 21 },
        { key: "2samuel", label: "2 Samuel", books: 24 },
        { key: "1kings", label: "1 Kings", books: 22 },
        { key: "2kings", label: "2 Kings", books: 25 },
        { key: "1chronicles", label: "1 Chronicles", books: 29 },
        { key: "2chronicles", label: "2 Chronicles", books: 36 },
        { key: "ezra", label: "Ezra", books: 10 },
        { key: "nehemiah", label: "Nehemiah", books: 13 },
        { key: "esther", label: "Esther", books: 10 }
    ];

    return (
        <section id="selection">
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="bordered">Open Menu</Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Dynamic Actions" items={bible}>
                    {(item) => (
                        <DropdownItem key={item.key}>{item.label}</DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        </section>
    )
}

export default Selection;