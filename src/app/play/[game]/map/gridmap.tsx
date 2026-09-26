"use client"

import { createGridmap, type Gridmap, type GridmapCell, type GridmapData } from "@project-gridmap/library";
import React, { useEffect, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import colours from "./config/colours.json";

type BibleBook = {
    key: string;
    name: string;
    chapters: number;
    verses: Array<number | string>;
};

type BibleDivision = {
    name: string;
    books: BibleBook[];
};

type BibleTestament = {
    name: string;
    divisions: BibleDivision[];
};

type GridmapProps = {
    data: BibleTestament[];
    device?: "mobile" | string;
    passage?: {
        book?: string;
        division?: string;
        testament?: string;
        chapter?: number | string;
    };
    select: (book: string, chapter: string | null, isBookKey?: boolean) => void;
    book?: string;
    bookFound?: boolean;
    divFound?: boolean;
    testFound?: boolean;
    narrativeHidden?: boolean;
    playing?: boolean;
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function buildBibleGridmapData(testaments: BibleTestament[]): GridmapData {
    return {
        layers: testaments.map((testament) => ({
            id: slug(testament.name),
            label: testament.name,
            groups: testament.divisions.map((division) => ({
                id: slug(division.name),
                label: division.name,
                items: division.books.map((book) => ({
                    id: book.key,
                    label: book.name,
                    shortLabel: book.key,
                    meta: {
                        bookName: book.name,
                        division: division.name,
                        testament: testament.name,
                    },
                    cells: Array.from({ length: book.chapters }, (_, index) => {
                        const chapter = index + 1;
                        return {
                            id: `${book.key}/${chapter}`,
                            label: String(chapter),
                            value: Number(book.verses[index]) || null,
                            meta: {
                                bookKey: book.key,
                                bookName: book.name,
                                chapter,
                                division: division.name,
                                testament: testament.name,
                            },
                        };
                    }),
                })),
            })),
        })),
    };
}

function findBookKey(testaments: BibleTestament[], bookName?: string) {
    if (!bookName) return null;

    for (const testament of testaments) {
        for (const division of testament.divisions) {
            const book = division.books.find((candidate) => candidate.name === bookName || candidate.key === bookName);
            if (book) return book.key;
        }
    }

    return null;
}

/**
 * Gridmap Component for displaying the Bible
 * @since 26th September 2026
 */
const BibleGridmap = (props: GridmapProps) => {
    const element = useRef<HTMLDivElement | null>(null);
    const gridmap = useRef<Gridmap | null>(null);
    const select = useRef(props.select);
    const gridmapData = useMemo(() => buildBibleGridmapData(props.data), [props.data]);

    useEffect(() => {
        select.current = props.select;
    }, [props.select]);

    useEffect(() => {
        if (!element.current) return;

        gridmap.current = createGridmap({
            container: element.current,
            data: gridmapData,
            colours: colours as Record<string, string>,
            colourBy: "item",
            itemLabels: props.device === "mobile" ? "short" : "full",
            markType: "number",
            markOpacity: props.narrativeHidden ? 0.3 : 0.55,
            numberMinPx: props.device === "mobile" ? 10 : 8,
            theme: {
                background: "#0a0b0c",
                text: "#f2efe8",
                mutedText: "#a19d94",
                faintText: "#5c5954",
                cellLine: "#2a2c2e",
                itemLine: "#7d7a74",
                groupLine: "#aeaaa2",
                layerLine: "#d9d5cd",
                font: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            },
            labels: {
                tooltip: (cell: GridmapCell) => `${cell.itemLabel} ${cell.label}`,
            },
            onSelectCell(cell: GridmapCell) {
                const bookKey = String(cell.meta.bookKey ?? cell.itemId);
                const chapter = String(cell.meta.chapter ?? cell.label);
                select.current(bookKey, chapter);
                toast.success(`${cell.itemLabel} ${chapter}`);
            },
        });

        return () => {
            gridmap.current?.destroy();
            gridmap.current = null;
        };
    }, []);

    useEffect(() => {
        gridmap.current?.setData(gridmapData);
    }, [gridmapData]);

    useEffect(() => {
        gridmap.current?.setConfig({
            itemLabels: props.device === "mobile" ? "short" : "full",
            markOpacity: props.narrativeHidden ? 0.3 : 0.55,
            numberMinPx: props.device === "mobile" ? 10 : 8,
        });
    }, [props.device, props.narrativeHidden]);

    useEffect(() => {
        const map = gridmap.current;
        if (!map) return;

        if (props.bookFound) {
            const bookKey = findBookKey(props.data, props.passage?.book);
            if (bookKey) {
                map.focusItem(bookKey);
            }
            return;
        }

        if (props.divFound && props.passage?.division) {
            map.focusGroup(slug(props.passage.division));
            return;
        }

        if (props.testFound) {
            map.focusMap();
            return;
        }

        map.focusMap();
    }, [
        props.bookFound,
        props.divFound,
        props.testFound,
        props.passage?.book,
        props.passage?.chapter,
        props.passage?.division,
        props.passage?.testament,
        props.data,
    ]);

    return (
        <div
            ref={element}
            className="fixed inset-0 h-[100dvh] w-screen touch-none"
            id="gridmap"
        />
    );
};

export default BibleGridmap;
