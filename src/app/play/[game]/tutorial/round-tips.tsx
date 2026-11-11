"use client"

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MousePointerIcon, PointerIcon } from "lucide-react";
import { motion } from "framer-motion";
import { StateUtil } from "@/core/util/state-util";
import { onZoom } from "@/app/play/[game]/tutorial/map-handle";
import { ENTRANCE } from "@/app/play/[game]/tutorial/tutorial";
import "@/app/play/[game]/tutorial/tutorial.sass";

/** Set once this device's player has zoomed the map themselves: the zoom note has taught its gesture, for good */
const ZOOMED = "map-zoomed";
const hasZoomed = () => { try { return localStorage.getItem(ZOOMED) === "1"; } catch { return false; } };
const rememberZoom = () => { try { localStorage.setItem(ZOOMED, "1"); } catch { /* it shows again next visit */ } };

/** A chapter as the reader says it: Psalms' chapters are each a psalm */
const chapterName = (book: string, chapter: string) => `${book === "Psalms" ? "Psalm" : book} ${chapter}`;

/** Where a book sits: its testament and division, as the Bible's structure has them */
function placeOf(bible: any, book: string): { testament: string; division: string } | null {
    for (const testament of bible.testaments)
        for (const division of testament.divisions)
            if (division.books.some((b: any) => b.name === book)) return { testament: testament.name, division: division.name };
    return null;
}

/** Where the answer must be, as narrowly as the guess shows it: its book, its division, or its testament */
function narrowed(bible: any, guess: string, answer: string): string {
    const g = placeOf(bible, guess), a = placeOf(bible, answer);
    if (!g || !a) return "";
    if (guess === answer) return `in ${answer}`;
    if (g.division === a.division) return `in ${a.division.replace(/^The /, "the ")}`;
    return `in the ${a.testament} Testament`;
}

const compact = Intl.NumberFormat("en", { notation: "compact" });

/**
 * What the first guess says, in the visitor's own terms: how far the answer is from it, which way, and where it must be
 * ("7,454 verses after 1 Chronicles 20 in the Old Testament"): the count in full, where the tile has it short. The
 * note keeps to two lines, so it comes in shorter forms too, longest first: the count short ("7.5K verses"), then without the place (the guess's colour still says it). Play keeps the guess (its distance negative
 * when the answer comes later)
 */
function explain(bible: any, answer: { id: number; book: string }): string[] | null {
    const guess: any = StateUtil.getGame(answer.id).guesses[0];
    if (!guess) return null;
    const distance = Number(guess.distance ?? guess.closeness?.distance), later = distance < 0, verses = Math.abs(distance);
    const where = narrowed(bible, guess.book, answer.book);
    const unit = verses === 1 ? "verse" : "verses";
    const from = `${later ? "after" : "before"} ${chapterName(guess.book, guess.chapter)}`;
    const full = `${verses.toLocaleString("en")} ${unit} ${from}`, short = `${compact.format(verses)} ${unit} ${from}`;
    return where ? [`${full} ${where}`, `${short} ${where}`, full, short] : [full, short];
}

/** The longest of the forms that fits the width over the given lines, in the note's own type (else the shortest); a
 * little is left over each line for where words break */
let measurer: CanvasRenderingContext2D | null = null;
function fitting(forms: string[], width: number, font: string, lines: number): string {
    measurer ??= document.createElement("canvas").getContext("2d");
    if (!measurer) return forms[forms.length - 1];
    measurer.font = font;
    const room = lines === 1 ? width : width * lines * 0.85;
    return forms.find((form) => measurer!.measureText(form).width <= room) ?? forms[forms.length - 1];
}

type Box = { x: number; y: number; width: number; height: number };
type Note = { id: "zoom" | "first"; text: string };

/** A mouse or trackpad (else a touch screen), as the page's own "Tap the map" / "Click to pick" tell them apart */
const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const ZOOM = ["Zoom on the map to reveal more detail"];

/** The pointer the visitor zooms with: an arrow with a mouse or trackpad, a finger on a touch screen */
const Pointer = () => {
    const Icon = fine() ? MousePointerIcon : PointerIcon;
    return <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75}/>;
};

/**
 * The round's notes, for every player, in the guesses' own row, where the empty slots give their room (tutorial.sass
 * hides them while a note shows; the first reading over two lines at most). Before any guess, that zooming on the map reveals more, with the pointer that does it,
 * until the player first zooms (remembered on this device); and in every round, once the first guess lands, what it
 * means, until the next guess lands. Everything else the page already says
 */
export default function RoundTips({ passage, bible }: { passage?: { id: number; book: string }; bible: any }) {
    const [note, setNote] = useState<Note | null>(null);
    const [box, setBox] = useState<Box | null>(null);
    const first = useRef<string[] | null>(null);
    // once the player has zoomed the map, here or on an earlier visit, the zoom note has done its job
    const zoomed = useRef<boolean | null>(null);
    if (zoomed.current === null && typeof window !== "undefined") zoomed.current = hasZoomed();
    // the entrance, once, as the zoom note first arrives (tutorial.sass): the clue's shimmer, then the note, then the
    // guess bar, each rising in as a guess's tile
    const shimmered = useRef(false);
    // the row's room changes (the page resizing, the clue settling): the note follows its size
    const resized = useRef<ResizeObserver | null>(null);
    // the row moves as the page condenses or opens (the map zoomed in or out, tutorial.sass): the note steps aside while
    // it does, then is placed again where the row has settled
    const [moving, setMoving] = useState(false);

    const check = useCallback(() => {
        const page = document.querySelector("[data-game-ready]");
        if (!page) return;
        // the round as the page says it (game.tsx's data-round and data-guesses), and the slots still to fill
        const tiles = Number(page.getAttribute("data-guesses") ?? 0);
        const empty = [...page.querySelectorAll("[data-play-part=guesses] > li[data-empty]")] as HTMLElement[];
        const playing = empty.length > 0 && page.getAttribute("data-round") === "playing";
        const row = page.querySelector("[data-play-part=guesses]");
        if (row) resized.current?.observe(row);
        const id = !playing ? null : tiles === 0 ? (zoomed.current ? null : "zoom") : tiles === 1 ? "first" : null;
        if (id) page.setAttribute("data-row-note", id); else page.removeAttribute("data-row-note");
        if (id === "zoom" && !shimmered.current) {
            shimmered.current = true;
            page.setAttribute("data-clue-shimmer", "");
            // kept until the last of the three (the clue, the zoom note, then the guess bar) is in
            window.setTimeout(() => page.removeAttribute("data-clue-shimmer"), ENTRANCE.lead + ENTRANCE.sweep + ENTRANCE.rise * 2 + 200);
        }
        if (!id) { setNote(null); setBox(null); return; }
        if (id === "first") first.current ??= passage ? explain(bible, passage) : null;
        // a first reading the page can't give (no passage to read it against) is simply left out
        if (id === "first" && !first.current) { page.removeAttribute("data-row-note"); setNote(null); setBox(null); return; }
        // over the empty slots, from the first to the last
        const a = empty[0].getBoundingClientRect(), b = empty[empty.length - 1].getBoundingClientRect();
        const width = b.right - a.left;
        // the longest form that fits inside the note's padding and border (and the pointer, for zoom): the zoom note on
        // one line, the first reading over two at most
        const room = width - 22 - (id === "zoom" ? 22 : 0) - 2;
        const text = fitting(id === "zoom" ? ZOOM : first.current!, room, `11px ${getComputedStyle(empty[0]).fontFamily}`, id === "zoom" ? 1 : 2);
        setNote(n => n?.id === id && n.text === text ? n : { id, text });
        setBox({ x: a.left, y: a.top, width, height: a.height });
    }, [passage, bible]);

    useEffect(() => onZoom(() => { if (!zoomed.current) { zoomed.current = true; rememberZoom(); check(); } }), [check]);

    useEffect(() => {
        resized.current = new ResizeObserver(() => check());
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener("resize", check);
        let settle = 0;
        const page = document.querySelector("[data-game-ready]");
        const condensing = new MutationObserver(() => {
            setMoving(true);
            window.clearTimeout(settle);
            // the condense transition's length (tutorial.sass, $condense), and a little more
            settle = window.setTimeout(() => { check(); setMoving(false); }, 600);
        });
        if (page) condensing.observe(page, { attributes: true, attributeFilter: ["data-condensed"] });
        return () => {
            condensing.disconnect();
            window.clearTimeout(settle);
            observer.disconnect();
            resized.current?.disconnect();
            window.removeEventListener("resize", check);
            document.querySelector("[data-game-ready]")?.removeAttribute("data-row-note");
        };
    }, [check]);

    if (!note || !box) return null;
    // both notes come in as the page brings in a guess's tile (guess.tsx's Tile): the zoom note once the clue has
    // arrived (the clue's entrance, tutorial.sass), the first-guess note with the guess beside it
    const zoom = note.id === "zoom";
    return <motion.p key={note.id} role="status" data-round-note data-moving={moving ? "" : undefined} initial={{ opacity: 0, y: 6, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                     transition={{ type: "spring", stiffness: 420, damping: 28, delay: zoom ? (ENTRANCE.lead + ENTRANCE.sweep) / 1000 : 0 }}
                     className="pointer-events-none fixed z-[30] flex items-center justify-center gap-2 rounded-lg border border-dashed border-play-line px-2.5 py-[3px] text-center text-[11px] leading-[13px] text-ui-muted"
                     style={{ left: box.x, top: box.y, width: box.width, minHeight: box.height }}>
        {zoom ? <Pointer/> : null}
        <span className={zoom ? "min-w-0 truncate" : "min-w-0"}>{note.text}</span>
    </motion.p>;
}
