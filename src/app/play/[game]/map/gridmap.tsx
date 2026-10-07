"use client"

import { createGridmap, type Gridmap, type GridmapCell, type GridmapData } from "@project-gridmap/library";
import React, { useEffect, useMemo, useRef } from "react";
import colours from "./config/colours.json";
import groups from "./config/groups.json";
import { playTheme } from "@/core/style/play-theme";
import type { RuledOut } from "@/app/play/[game]/ruled-out";

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
    /** Cell id ("BOOK/chapter") to show as selected, e.g. after stepping chapters outside the map */
    selection?: string | null;
    /** Chapters the guesses exclude, by cell id, with the reason: barely visible on the map, and can't be selected */
    ruledOut?: RuledOut;
    /** Show each book's named chapter groups (config/groups.json): dotted partitions in the book's colour, with labels on their borders. On unless false */
    showGroups?: boolean;
};

type BookGroups = Record<string, Array<{ name: string; start: number; end: number }>>;

const NONE: RuledOut = new Map();

/** The mark on a filled cell (selected, or the answer), dark so it reads against the colour */
const ANSWER_MARK = "#000000";
const ANSWER_FONT = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

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
                    // the library calls a chapter range within a book a section
                    sections: (groups as BookGroups)[book.name.toLowerCase()]?.map(({ name, start, end }) => ({ label: name, start, end })),
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
    const ruledOut = useRef(props.ruledOut ?? NONE);
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
            itemLabels: "full",
            markType: "number",
            markOpacity: props.narrativeHidden ? 0.3 : 0.55,
            numberMinPx: props.device === "mobile" ? 10 : 8,
            disabledCells: [...ruledOut.current.keys()],
            disabledOpacity: 0.9,
            layout: "fit",
            showSections: props.showGroups ?? true,
            theme: {
                background: playTheme.bg,
                text: playTheme.text,
                // testament labels: faint, with the selected testament's label a step brighter (it takes layerLine)
                mutedText: playTheme.faint,
                faintText: playTheme.faint,
                cellLine: playTheme.line,
                itemLine: playTheme.faint,
                // structure sits beneath the coloured books: division boundaries recede, the testament frame stays legible
                groupLine: "#5a5d63",
                layerLine: playTheme.faint,
                // chapter groups sit quieter still: hairlines between them, small labels
                sectionLine: playTheme.line,
                sectionText: playTheme.faint,
                font: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            },
            labels: {
                tooltip: (cell: GridmapCell) => `${cell.itemLabel} ${cell.label}`,
                // tapping a ruled-out chapter says why, instead of selecting it
                disabled: (cell: GridmapCell) => `${cell.itemLabel} ${cell.label}: ${ruledOut.current.get(cell.id)}`,
            },
            onSelectCell(cell: GridmapCell) {
                const bookKey = String(cell.meta.bookKey ?? cell.itemId);
                const chapter = String(cell.meta.chapter ?? cell.label);
                select.current(bookKey, chapter);
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
            itemLabels: "full",
            markOpacity: props.narrativeHidden ? 0.3 : 0.55,
            numberMinPx: props.device === "mobile" ? 10 : 8,
        });
    }, [props.device, props.narrativeHidden]);

    useEffect(() => {
        gridmap.current?.setConfig({ showSections: props.showGroups ?? true });
    }, [props.showGroups]);

    useEffect(() => {
        ruledOut.current = props.ruledOut ?? NONE;
        gridmap.current?.setDisabledCells(ruledOut.current.keys());
    }, [props.ruledOut]);

    useEffect(() => {
        const map = gridmap.current;
        if (map && props.selection && map.getSelectedCell()?.id !== props.selection) map.selectCell(props.selection);
    }, [props.selection]);

    useEffect(() => {
        const map = gridmap.current;
        if (!map) return;

        // game over: the whole map, nothing veiled, with the answer marked (below)
        if (props.playing === false) {
            map.focusMap();
            return;
        }

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
        props.playing,
    ]);

    // Once the game is over, the answer is marked so it stands out on the whole map: filled solid in its book's colour
    // with a dark mark, like a selected chapter, and a glowing ring around it that stays visible even when the chapter
    // is only a few pixels wide.
    const answer = props.playing === false ? `${findBookKey(props.data, props.passage?.book)}/${props.passage?.chapter}` : null;
    useEffect(() => {
        const map = gridmap.current;
        if (!map || !answer) return;

        return map.addLayer(({ ctx, model, camera, rect, toScreenX, toScreenY, colourOf }) => {
            const cell = model.cells.find((candidate) => candidate.id === answer);
            if (!cell) return;

            const colour = colourOf(cell, playTheme.text);
            const ring = 4;
            ctx.save();
            ctx.fillStyle = colour;
            ctx.strokeStyle = colour;
            ctx.beginPath();
            rect(cell);
            ctx.fill();

            // the dark mark: the chapter number where the cell is big enough to read it, else a dot
            const size = Math.min(cell.width, cell.height) * camera.k;
            ctx.fillStyle = ANSWER_MARK;
            if (size >= 14) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `500 ${Math.min(24, size * 0.6)}px ${ANSWER_FONT}`;
                ctx.fillText(cell.label, toScreenX(cell.centerX), toScreenY(cell.centerY));
            } else {
                ctx.beginPath();
                ctx.arc(toScreenX(cell.centerX), toScreenY(cell.centerY), Math.max(1.5, size * 0.25), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.lineWidth = 2;
            ctx.shadowColor = colour;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.rect(toScreenX(cell.x) - ring, toScreenY(cell.y) - ring,
                cell.width * camera.k + ring * 2, cell.height * camera.k + ring * 2);
            ctx.stroke();
            ctx.restore();
        });
    }, [answer]);

    return (
        <div
            ref={element}
            className="absolute inset-0 touch-none"
            id="gridmap"
        />
    );
};

export default BibleGridmap;
