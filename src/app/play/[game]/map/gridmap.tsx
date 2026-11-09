"use client"

import { createGridmap, DEFAULT_FIT_RATIOS, installChapterReader, type Gridmap, type GridmapCell, type GridmapData } from "@project-gridmap/library";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import groups from "./config/groups.json";
import { playTheme } from "@/core/style/play-theme";
import { alpha, bookColours } from "@/core/style/regions";
import type { RuledOut } from "@/app/play/[game]/ruled-out";
import { getPassage } from "@/core/action/read/get-passage";
import { useReaderSettings } from "@/app/read/[[...passage]]/use-reader-settings";
import translations from "@/app/read/[[...passage]]/translations.json";

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

export type BibleTestament = {
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
    /** Chapters already guessed and missed, by cell id: each marked with an X in its book's colour */
    missed?: string[];
    /** Under the home page's landing: the map is explored, not played; when it ends the map is set back for the round */
    landing?: boolean;
};

type BookGroups = Record<string, Array<{ name: string; start: number; end: number }>>;

const NONE: RuledOut = new Map();

/** The mark on a filled cell (selected, or the answer), dark so it reads against the colour */
const ANSWER_MARK = playTheme.bg;

/**
 * The map is background, so it is lit sparingly: books in the quiet map tone, on their outlines and labels only (the
 * chapter-group partitions a faint trace, the chapter marks neutral); the selected chapter takes its region's light.
 */
export const MAP_COLOURS = bookColours("map");
export const LIGHT_COLOURS = bookColours("light");
/** Borders, labels and chapter-group lines: the map tones, with the red a touch lighter so its outlines read as clearly as the others' */
export const FOREGROUND_COLOURS = Object.fromEntries(Object.entries(MAP_COLOURS)
    .map(([book, colour]) => [book, colour.toLowerCase() === "#c2877e" ? "#c98d84" : colour]));
export const colourParts = (narrativeHidden?: boolean) => ({
    borders: { opacity: 0.92 },
    sections: { opacity: 0.22 },
    marks: { coloured: false, opacity: narrativeHidden ? 0.2 : 0.28 },
    labels: { opacity: 1 },
});
const FALLBACK_MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

/** The interface's mono face (IBM Plex Mono, set as --font-mono by the root layout), read at draw time so the canvas can use it */
function monoFont(): string {
    if (typeof window === "undefined") return FALLBACK_MONO;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim();
    return family ? `${family}, ${FALLBACK_MONO}` : FALLBACK_MONO;
}

const FALLBACK_SERIF = "Georgia, serif";

/** Scripture's face in the map's chapter reader (IBM Plex Serif, set as --font-serif by the root layout), read at draw time for the canvas too */
function serifFont(): string {
    if (typeof window === "undefined") return FALLBACK_SERIF;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-serif").trim();
    return family ? `${family}, ${FALLBACK_SERIF}` : FALLBACK_SERIF;
}

/** Chapter text appears once the map is zoomed to 12.5× its whole-map overview */
const TEXT_ZOOM = 12.5;

type PassageVerse = { book_id?: string; chapter?: number | string; verse?: number | string; text?: string };

/** Loads a chapter's verses for the map's reader from the passage service (as Read does), in the reader's translation */
function chapterLoader(translation: () => string) {
    const cache = new Map<string, { verses: string[] }>();
    return async (cell: GridmapCell, { signal }: { signal: AbortSignal }) => {
        const bookName = String(cell.meta.bookName ?? cell.itemLabel);
        const chapter = Number(cell.meta.chapter ?? cell.label);
        const key = `${translation()}:${cell.id}`;
        const cached = cache.get(key);
        if (cached) return cached;
        const passage = await getPassage(`${bookName} ${chapter}`, translation());
        if (signal.aborted) throw new DOMException("Request cancelled", "AbortError");
        const rows: PassageVerse[] = Array.isArray(passage?.verses) ? passage.verses : [];
        const verses = rows.filter((verse) => Number(verse.chapter) === chapter && typeof verse.text === "string" && verse.text.trim())
            .map((verse) => verse.text!.trim().replace(/\s+/g, " "));
        if (!verses.length) throw new Error("Chapter unavailable. Please retry.");
        const result = { verses };
        if (cache.size >= 128) cache.delete(cache.keys().next().value!);
        cache.set(key, result);
        return result;
    };
}

/** The map's theme: drawn straight onto the ground, its structure in faint glass lines beneath the coloured books */
export function mapTheme() {
    return {
        // drawn straight onto the ground: ruled-out cells fade by erasing, and labels cut the lines behind them
        background: "transparent",
        text: playTheme.text,
        // testament labels: faint, with the selected testament's label a step brighter (it takes layerLine)
        mutedText: playTheme.faint,
        faintText: playTheme.faint,
        cellLine: "rgba(180, 195, 255, 0.06)",
        itemLine: "rgba(180, 195, 255, 0.30)",
        // structure sits beneath the coloured books, faint enough not to paint over their outlines
        groupLine: "rgba(180, 195, 255, 0.16)",
        layerLine: "rgba(180, 195, 255, 0.30)",
        // chapter groups sit quieter still: hairlines between them, small labels
        sectionLine: "rgba(180, 195, 255, 0.14)",
        sectionText: "#6e7280",
        selectedMark: playTheme.bg,
        font: monoFont(),
    };
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function buildBibleGridmapData(testaments: BibleTestament[]): GridmapData {
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
                    // groups.json spells Matthew "mathew"
                    sections: ((groups as BookGroups)[book.name.toLowerCase()] ?? (groups as BookGroups)[({ matthew: "mathew" } as Record<string, string>)[book.name.toLowerCase()]])?.map(({ name, start, end }) => ({ label: name, start, end })),
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
    // Zoomed in during a round, the page condenses (data-condensed on the page, tutorial.sass): the guess tiles, the
    // clue's second line and the bar's caption give their room to the map, which holds its shape (its fit ratio) and
    // its view (resizeAnchor) as it grows. It condenses once the player zooms in past 2× the whole map, and opens again
    // below 1.6× (the gap keeps it from flickering at the edge), or whenever the round moves on: a guess, a find, the
    // end, so nothing new happens out of sight. Only the player's own zoom condenses; Play's and the tutorial's don't
    const condensed = useRef(false);
    const lastSource = useRef("");
    const zoom = useRef(1);
    const free = useRef<number | undefined>(undefined);
    // in a round (not on the landing, where the map is explored at its size on Play)
    const inRound = useRef(false);
    inRound.current = props.playing !== false && !props.landing;
    const onLanding = useRef(false);
    onLanding.current = !!props.landing;
    const setCondensed = useCallback((on: boolean) => {
        const map = gridmap.current;
        const page = element.current?.closest("[data-game-ready]");
        if (!map || !page || condensed.current === on) return;
        condensed.current = on;
        window.clearTimeout(free.current);
        if (on) {
            const ratio = map.getModel()?.fitRatio;
            if (ratio) map.setConfig({ fitRatios: [ratio] });
            page.setAttribute("data-condensed", "");
        } else {
            page.removeAttribute("data-condensed");
            // once the page has opened again, the shape can follow it; the landing holds it throughout (landing-overlay.tsx)
            if (!onLanding.current) free.current = window.setTimeout(() => gridmap.current?.setConfig({ fitRatios: DEFAULT_FIT_RATIOS }), 800);
        }
    }, []);
    const onZoom = useRef((value: number) => {
        zoom.current = value;
        // decided after the map's render, never inside it
        window.setTimeout(() => {
            if (!inRound.current) setCondensed(false);
            else if (!condensed.current && zoom.current >= 2 && lastSource.current === "user") setCondensed(true);
            else if (condensed.current && zoom.current <= 1.6) setCondensed(false);
        }, 0);
    });
    useEffect(() => { setCondensed(false); }, [props.missed?.length, props.bookFound, props.divFound, props.testFound, props.playing, props.landing, setCondensed]);

    const [readerSettings] = useReaderSettings();
    const translation = useRef("web");
    translation.current = (translations as Record<string, { abbr: string }>)[readerSettings.translation]?.abbr ?? "web";

    useEffect(() => {
        select.current = props.select;
    }, [props.select]);

    useEffect(() => {
        if (!element.current) return;

        gridmap.current = createGridmap({
            container: element.current,
            data: gridmapData,
            colours: MAP_COLOURS,
            selectedColours: LIGHT_COLOURS,
            foregroundColours: FOREGROUND_COLOURS,
            colourParts: colourParts(props.narrativeHidden),
            colourBy: "item",
            itemLabels: "full",
            markType: "number",
            numberMinPx: props.device === "mobile" ? 10 : 8,
            disabledCells: [...ruledOut.current.keys()],
            disabledOpacity: 0.9,
            // as the page around it gives way (the landing, a condensed round) a zoomed-in view stays just where it is
            resizeAnchor: "screen",
            crossedCells: props.missed ?? [],
            layout: "fit",
            // overview favours book abbreviations and division names; closer in, full names
            semanticZoom: true,
            // room to zoom in far enough to read a chapter
            maxCellViewportRatio: 1.8,
            showSections: props.showGroups ?? true,
            theme: mapTheme(),
            labels: {
                // no label on hover (globals.sass hides the empty tooltip); a ruled-out chapter still says why
                tooltip: () => "",
                // tapping a ruled-out chapter says why, instead of selecting it
                disabled: (cell: GridmapCell) => `${cell.itemLabel} ${cell.label}: ${ruledOut.current.get(cell.id)}`,
            },
            onSelectCell(cell: GridmapCell) {
                const bookKey = String(cell.meta.bookKey ?? cell.itemId);
                const chapter = String(cell.meta.chapter ?? cell.label);
                select.current(bookKey, chapter);
            },
        });

        // zoomed in far enough, the prime book's chapters become readable, paged passages
        const removeReader = installChapterReader(gridmap.current, {
            revealContent: true,
            getRevealZoom: () => TEXT_ZOOM,
            loadChapter: chapterLoader(() => translation.current),
            requestIntervalMs: 2100,
            scriptureFont: serifFont(),
            onZoom: (zoom) => onZoom.current(zoom),
        });

        // whose move it was, for the condensing above: only the player's own zoom condenses the page
        const stopHearing = gridmap.current.on("cameraChange", (change) => { lastSource.current = (change as { source: string }).source; });

        let alive = true;
        document.fonts?.load(`500 12px ${monoFont()}`).then(() => { if (alive) gridmap.current?.setColours(MAP_COLOURS); }).catch(() => {});

        return () => {
            alive = false;
            stopHearing();
            removeReader();
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
            colourParts: colourParts(props.narrativeHidden),
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

    // where the round's guesses put the map: the answer's book or division once found, else the whole map (and the
    // whole map once the game is over, nothing veiled, with the answer marked, below)
    const roundFocus = (): { level: "map" } | { level: "item" | "group"; value: string } => {
        if (props.playing === false) return { level: "map" };
        if (props.bookFound) {
            const bookKey = findBookKey(props.data, props.passage?.book);
            return bookKey ? { level: "item", value: bookKey } : { level: "map" };
        }
        if (props.divFound && props.passage?.division) return { level: "group", value: slug(props.passage.division) };
        return { level: "map" };
    };

    useEffect(() => {
        const map = gridmap.current;
        if (!map) return;
        const focus = roundFocus();
        if (focus.level === "map") map.focusMap();
        else map.setFocus(focus.level, focus.value);
    // the round's own changes, not roundFocus (remade each render)
    }, [ // eslint-disable-line react-hooks/exhaustive-deps
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

    // The landing's map is explored, not played (Game ignores its taps), so when the landing hands over to the round
    // whatever the visitor picked is let go and the map glides back to the round's own place, condensing to its size on
    // Play as it goes (the landing held it to the shape Play gave it, landing-overlay.tsx; once it's there, the shape is
    // free to follow the page again)
    const wasLanding = useRef(!!props.landing);
    useEffect(() => {
        const map = gridmap.current;
        const ended = wasLanding.current && !props.landing;
        wasLanding.current = !!props.landing;
        if (!map || !ended) return;
        map.clearSelection();
        const focus = roundFocus();
        map.glideTo(focus.level, focus.level === "map" ? undefined : focus.value, { duration: 700 });
        const free = window.setTimeout(() => gridmap.current?.setConfig({ fitRatios: DEFAULT_FIT_RATIOS }), 1000);
        return () => clearTimeout(free);
    }, [props.landing]); // eslint-disable-line react-hooks/exhaustive-deps

    // Once the game is over, the answer is marked so it stands out on the whole map: filled solid in its region's light
    // with a dark mark, like a selected chapter, and a glowing ring around it that stays visible even when the chapter
    // is only a few pixels wide.
    const answer = props.playing === false ? `${findBookKey(props.data, props.passage?.book)}/${props.passage?.chapter}` : null;
    useEffect(() => {
        const map = gridmap.current;
        if (!map || !answer) return;

        return map.addLayer(({ ctx, model, camera, rect, toScreenX, toScreenY }) => {
            const cell = model.cells.find((candidate) => candidate.id === answer);
            if (!cell) return;

            const colour = LIGHT_COLOURS[cell.itemId] ?? playTheme.text;
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
                ctx.font = `500 ${Math.min(24, size * 0.6)}px ${monoFont()}`;
                ctx.fillText(cell.label, toScreenX(cell.centerX), toScreenY(cell.centerY));
            } else {
                ctx.beginPath();
                ctx.arc(toScreenX(cell.centerX), toScreenY(cell.centerY), Math.max(1.5, size * 0.25), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.lineWidth = 2;
            ctx.shadowColor = alpha(colour, 0.5);
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.rect(toScreenX(cell.x) - ring, toScreenY(cell.y) - ring,
                cell.width * camera.k + ring * 2, cell.height * camera.k + ring * 2);
            ctx.stroke();
            ctx.restore();
        });
    }, [answer]);

    // A missed guess is marked where it was made: in place of its number, an X in its book's own light (as a selected
    // chapter's fill) over a faint wash of it, the ground and lines still showing, so the map shows where's been tried
    const missedKey = (props.missed ?? []).join(",");
    useEffect(() => {
        gridmap.current?.setCrossedCells(props.missed ?? []);
    }, [missedKey]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={element}
            className="absolute inset-0 touch-none"
            id="gridmap"
        />
    );
};

export default BibleGridmap;
