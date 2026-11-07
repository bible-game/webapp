"use client"

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MousePointerIcon, PointerIcon } from "lucide-react";
import { motion } from "framer-motion";
import { StateUtil } from "@/core/util/state-util";
import { onZoom } from "@/app/play/[game]/tutorial/map-handle";
import { ENTRANCE } from "@/app/play/[game]/tutorial/tutorial";
import "@/app/play/[game]/tutorial/tutorial.sass";

const SEEN = "round-tips-seen";
export const roundTipsSeen = () => { try { return localStorage.getItem(SEEN) === "1"; } catch { return false; } };
const remember = () => { try { localStorage.setItem(SEEN, "1"); } catch { /* it shows again */ } };

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

/**
 * What the first guess says, in the visitor's own terms and one sentence, with the answer as its subject, as the arrow
 * reads: how far the answer is from the guess (in full, where the tile has it short), which way, and where it must be. Play
 * keeps the guess (its distance negative when the answer comes later)
 */
function explain(bible: any, answer: { id: number; book: string }): string | null {
    const guess: any = StateUtil.getGame(answer.id).guesses[0];
    if (!guess) return null;
    const distance = Number(guess.distance ?? guess.closeness?.distance), later = distance < 0;
    const where = narrowed(bible, guess.book, answer.book);
    const verses = `${Math.abs(distance).toLocaleString("en")} ${Math.abs(distance) === 1 ? "verse" : "verses"}`;
    return `The answer is ${verses} ${later ? "after" : "before"} ${chapterName(guess.book, guess.chapter)}${where ? `, ${where}` : ""}.`;
}

type Box = { x: number; y: number; width: number; height: number };
type Note = { id: "zoom" | "first"; text: string };

/** A mouse or trackpad (else a touch screen), as the page's own "Tap the map" / "Click to pick" tell them apart */
const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const ZOOM = "Zoom on the map to reveal more detail";

/** The pointer the visitor zooms with: an arrow with a mouse or trackpad, a finger on a touch screen */
const Pointer = () => {
    const Icon = fine() ? MousePointerIcon : PointerIcon;
    return <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75}/>;
};

/**
 * The first round's notes, in the guesses' own row, where the empty slots give their room (tutorial.sass hides them while
 * a note shows): before any guess, that zooming on the map reveals more, with the pointer that does it, until the
 * visitor zooms; once the first guess lands,
 * what it means, until the next guess takes a slot. Everything else the page already says
 */
export default function RoundTips({ passage, bible }: { passage?: { id: number; book: string }; bible: any }) {
    const [note, setNote] = useState<Note | null>(null);
    const [box, setBox] = useState<Box | null>(null);
    const first = useRef<string | null>(null);
    // once the visitor has zoomed the map, the zoom note has done its job
    const zoomed = useRef(false);
    // the entrance, once, as the zoom note first arrives (tutorial.sass): the clue's shimmer, then the note, then the
    // guess bar, each rising in as a guess's tile
    const shimmered = useRef(false);

    const check = useCallback(() => {
        const page = document.querySelector("[data-game-ready]");
        if (!page) return;
        // the round as the page says it (game.tsx's data-round and data-guesses), and the slots still to fill
        const tiles = Number(page.getAttribute("data-guesses") ?? 0);
        const empty = [...page.querySelectorAll("[data-play-part=guesses] > li[data-empty]")];
        const playing = empty.length > 0 && page.getAttribute("data-round") === "playing";
        const id = !playing ? null : tiles === 0 ? (zoomed.current ? null : "zoom") : tiles === 1 ? "first" : null;
        if (id) page.setAttribute("data-row-note", id); else page.removeAttribute("data-row-note");
        if (id === "zoom" && !shimmered.current) {
            shimmered.current = true;
            page.setAttribute("data-clue-shimmer", "");
            // kept until the last of the three (the clue, the zoom note, then the guess bar) is in
            window.setTimeout(() => page.removeAttribute("data-clue-shimmer"), ENTRANCE.lead + ENTRANCE.sweep + ENTRANCE.rise * 2 + 200);
        }
        if (!id) { setNote(null); setBox(null); return; }
        if (id === "first") { remember(); first.current ??= passage ? explain(bible, passage) : null; }
        // a first reading the page can't give (no passage to read it against) is simply left out
        if (id === "first" && !first.current) { page.removeAttribute("data-row-note"); setNote(null); setBox(null); return; }
        setNote(n => n?.id === id ? n : { id, text: id === "zoom" ? ZOOM : first.current ?? "" });
        const a = empty[0].getBoundingClientRect(), b = empty[empty.length - 1].getBoundingClientRect();
        setBox({ x: a.left, y: a.top, width: b.right - a.left, height: a.height });
    }, [passage, bible]);

    useEffect(() => onZoom(() => { if (!zoomed.current) { zoomed.current = true; check(); } }), [check]);

    useEffect(() => {
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener("resize", check);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", check);
            document.querySelector("[data-game-ready]")?.removeAttribute("data-row-note");
        };
    }, [check]);

    if (!note || !box) return null;
    // both notes come in as the page brings in a guess's tile (guess.tsx's Tile): the zoom note once the clue has
    // arrived (the clue's entrance, tutorial.sass), the first-guess note with the guess beside it
    const zoom = note.id === "zoom";
    return <motion.p key={note.id} role="status" initial={{ opacity: 0, y: 6, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                     transition={{ type: "spring", stiffness: 420, damping: 28, delay: zoom ? (ENTRANCE.lead + ENTRANCE.sweep) / 1000 : 0 }}
                     className="pointer-events-none fixed z-[30] flex items-center justify-center gap-2 rounded-lg border border-dashed border-play-line px-2.5 py-[3px] text-center text-[11px] leading-[13px] text-ui-muted"
                     style={{ left: box.x, top: box.y, width: box.width, minHeight: box.height }}>
        {zoom ? <Pointer/> : null}
        <span>{note.text}</span>
    </motion.p>;
}
