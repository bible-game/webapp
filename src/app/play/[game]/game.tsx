"use client"

import Summary from "@/app/play/[game]/summary";
import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import useSWR from "swr";
import { Passage } from "@/core/model/play/passage";
import { DateValue, getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";
import Action from "@/app/play/[game]/action";
import Header from "@/app/play/[game]/header";
import Confetti from "@/core/component/confetti";
import Gridmap from "@/app/play/[game]/map/gridmap";
import moment from "moment/moment";
import PopUp from "./pop-up";
import { redirect } from "next/navigation";
import { StateUtil } from "@/core/util/state-util";
import { GameState } from "@/core/model/state/game-state";
import { ruledOut } from "@/app/play/[game]/ruled-out";
import { MotionConfig, useReducedMotion } from "framer-motion";
import { getGameState } from "@/core/action/state/get-state-game";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Game Component
 * @since 13th May 2025
 */
export default function Game(props: any) {
    const reducedMotion = useReducedMotion();
    // The game reads this device's storage as it renders, so it only ever renders in the browser; the layout's skeleton
    // covers the server render and hydration
    const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
    if (props.game == 'today') {
        redirect(`/play/${moment(new Date()).format('YYYY-MM-DD')}`);
    }

    // The server sends the day's passage with the page; the browser fetches it only if that failed
    const {data, error, isLoading} = useSWR(`${process.env.SVC_PASSAGE}/daily/${props.game}`, fetcher,
        { fallbackData: props.passage, revalidateOnMount: !props.passage });
    const passage = data as Passage;

    const [playing, setPlaying] = useState(true);
    const [guesses, setGuesses] = useState([] as any[]); // question :: apply type?
    const [testaments, setTestaments] = useState(props.bible.testaments);
    const [divisions, setDivisions] = useState(props.divisions);
    const [books, setBooks] = useState(props.books);
    const [allBooks, setAllBooks] = useState(props.books);
    const [allDivisions, setAllDivisions] = useState(props.divisions);
    const [chapters, setChapters] = useState([] as any);
    const [selected, setSelected] = useState({} as Passage);
    const [book, setBook] = useState('');
    const [chapter, setChapter] = useState('');
    const [testamentFound, setTestamentFound] = useState(false as any);
    const [divisionFound, setDivisionFound] = useState(false as any);
    const [bookFound, setBookFound] = useState(false as any);
    const [chapterFound, setChapterFound] = useState(false as any);
    const [dates, setDates] = useState(data);
    const [date, setDate] = useState<DateValue>(parseDate(TODAY(getLocalTimeZone()).toString()));
    const [hasBook, setHasBook] = useState(false);
    const [maxChapter, setMaxChapter] = useState(0);
    const [stars, setStars] = useState(0);
    const [state, setState] = useState({} as any);
    const [confetti, setConfetti] = useState(false);
    const narrativeHidden = true;
    // what the guesses so far exclude; the whole map comes back once the game is over
    const excluded = useMemo(() => playing ? ruledOut(testaments, guesses, passage?.book) : new Map<string, string>(),
        [testaments, guesses, playing, passage?.book]);

    useEffect(() => {
        if (confetti) setConfetti(false);

        if (typeof window !== "undefined" && passage) loadState();
    }, [passage]);

    // Re-sync state from localStorage when returning to the page (bfcache / tab switch)
    useEffect(() => {
        function handleVisibilityChange() {
            if (document.visibilityState === 'visible' && passage) {
                loadState();
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [passage]);

    // A logged-in player's other games (for the calendar and their stats) are fetched once the page is up, rather than
    // sent with it. A guess made meanwhile is newer than the fetched copy of today's game, so it is kept.
    useEffect(() => {
        if (!props.loggedIn) return;
        getGameState().then(games => {
            if (!games) return;
            const current = passage ? StateUtil.getGame(passage.id) : undefined;
            StateUtil.setAllGame(games);
            if (current && current.guesses.length > (games.get(current.passageId)?.guesses.length ?? 0)) StateUtil.setGame(current);
        }).catch(e => console.error(e));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function loadState() {
        // The page's copy of today's game goes stale once the player guesses, so it never replaces a longer local one
        if (props.played && props.played.guesses.length >= StateUtil.getGame(props.played.passageId).guesses.length)
            StateUtil.setGame(props.played);

        if (passage) {
            const state = StateUtil.getGame(passage.id);
            // guesses saved by the user service (or before keys were stored) carry only the book's name; the tiles need its key for the region colour
            setGuesses(state.guesses.map((g: any) => g.bookKey ? g : { ...g, bookKey: props.books.find((bk: any) => bk.name == g.book)?.key }))
            setStars(state.stars || 0)
            setPlaying(state.playing)
            setState(state);
        }
    }

    function selectBook(item: string, disabled?: boolean): void {
        if (disabled) return;
        if (!item) {
            clearSelection();
            return;
        }

        selected.book = item;

        const chapters = [];
        const numChapters = allBooks!!.find((book: any) => book.name === item).chapters;
        for (let i = 1; i <= numChapters; i++) chapters.push({name: i.toString()});

        setMaxChapter(numChapters);
        setHasBook(true);

        const chapter = '1';
        setChapter(chapter);
        selected.chapter = chapter;
        setChapters(chapters);

        const division = allDivisions.find((div: any) => div.books.some((book: any) => book.name == item));
        selectDivision(division.name);
    }

    function selectDivision(item: string): void {
        selected.division = item;

        setBooks(allDivisions!!.find(
            (div: any) => div.name === item
        ).books);

        const testament = testaments.find((test: any) => test.divisions.some((div: any) => div.name == item));
        selectTestament(testament.name);
    }

    function selectTestament(item: string): void {
        selected.testament = item;

        setDivisions(testaments.find(
            (test: any) => test.name === item
        ).divisions);
    }

    function selectChapter(item: string): void {
        setChapter(item);
        selected.chapter = item;

        // selected.icon = allBooks!!.find((book: any) => book.name === selected.book).icons[parseInt(item) - 1];

    }

    function addGuess(newGuess: any) {
        newGuess.bookKey = allBooks.find((bk: any) => bk.name == selected.book).key;
        const updatedGuesses = [
            ...guesses,
            newGuess
        ];

        setGuesses(updatedGuesses);

        if (selected.book == passage.book) {
            setBook(passage.book);
            setBookFound(true);
        }
        if (selected.chapter == passage.chapter) {
            setChapter(passage.chapter);
            setChapterFound(true);
        }

        if (selected.testament == passage.testament) {
            setTestamentFound(true);
        }
        if (selected.division == passage.division) {
            setDivisionFound(true);
        }

        let starResult = 0
        const won = (newGuess.distance == 0);
        const limitReached = (updatedGuesses.length >= 5);
        if (won) {
            setConfetti(true);
        }
        if (won || limitReached) {
            setPlaying(false);
            starResult = won ? 5 + 1 - updatedGuesses.length : 0;
        }

        setStars(starResult);
        const state: GameState = {
            stars: starResult,
            guesses: updatedGuesses,
            playing: !(won || limitReached),
            passageId: passage.id,
            passageBook: passage.book,
            passageChapter: passage.chapter,
            createdDate: new Date(),
            lastModified: new Date()
        }
        StateUtil.setGame(state);
    }

    // fixme :: behaviour not correct
    function clearSelection(): void {
        selected.testament = '';
        selected.division = '';
        selected.book = '';
        selected.chapter = '';
        setBook('');
        setChapter('');
        setHasBook(false);
        setChapters([]);
        setMaxChapter(0);
        setBooks(allBooks);
        setDivisions(allDivisions);
    }

    function isExistingGuess() {
        return guesses.map(guess => guess.book + guess.chapter)
            .includes(selected.book + selected.chapter);
    }

    function isInvalidGuess(icon: string) {
        return false;
        // return passage.icon != icon;
    }

    const cellOf = (chapter: string | number) => `${allBooks.find((bk: any) => bk.name == selected.book)?.key}/${chapter}`;

    /** The nearest chapter in the given direction, within the book, that isn't ruled out (or null) */
    function nextChapter(delta: number): number | null {
        let next = parseInt(selected.chapter) + delta;
        while (next >= 1 && next <= maxChapter && excluded.has(cellOf(next))) next += delta;
        return next >= 1 && next <= maxChapter ? next : null;
    }

    /** Moves the selected chapter back or forward, staying within the book and skipping ruled-out chapters */
    function step(delta: number) {
        const next = nextChapter(delta);
        if (next) selectChapter(next.toString());
    }

    function select(book: any, chapter: any, isBookKey = true) {
        if (isBookKey) {
            const bookName = allBooks.find((bk: any) => bk.key == book).name;
            if (book) selectBook(bookName);

        } else {
            selectBook(book);
        }
        if (chapter) selectChapter(chapter);
    }

    if (!mounted || isLoading) return null
    else {
        passage.division = props.divisions.find((div: any) => div.books.some((book: any) => book.name == passage.book)).name;
        passage.bookKey ||= props.books.find((bk: any) => bk.name == passage.book)?.key;
        passage.testament = props.bible.testaments.find((test: any) => test.divisions.some((div: any) => div.name == passage.division)).name;

        return (
            <MotionConfig reducedMotion="user">
            <div data-game-ready className="play-ui fixed inset-0 z-0 flex h-[100dvh] flex-col overflow-hidden bg-transparent pt-[env(safe-area-inset-top)] text-play-text">
                <PopUp />
                <div className="mx-auto flex w-full max-w-[40rem] shrink-0 flex-col">
                    <Header info={props.info} date={props.game}/>
                    <Summary passage={passage} playing={playing} guesses={guesses}/>
                </div>

                <div className="mx-auto min-h-0 w-full max-w-[40rem] flex-1">
                    <div className="h-full w-full p-3 sm:p-6">
                        <div className="relative h-full w-full">
                            <Gridmap passage={passage} select={select} bookFound={bookFound} divFound={divisionFound}
                                     testFound={testamentFound} data={testaments} book={book} device={props.device}
                                     narrativeHidden={narrativeHidden}
                                     selection={hasBook ? cellOf(chapter) : null}
                                     ruledOut={excluded} playing={playing}/>
                        </div>
                    </div>
                </div>

                <section className="mx-auto !w-full max-w-[40rem] shrink-0 pb-[env(safe-area-inset-bottom)]">
                    <Action passage={passage} playing={playing} stars={stars} celebrate={confetti} isExistingGuess={isExistingGuess}
                            date={props.game} addGuess={addGuess} selected={selected} hasBook={hasBook}
                            step={step} canStep={(delta: number) => nextChapter(delta) !== null}
                            ruledOut={hasBook ? excluded.get(cellOf(chapter)) : undefined}
                            bible={props.bible} chapter={chapter} guesses={guesses} info={props.info} known={props.known}/>
                </section>
                <Confetti fire={confetti && !reducedMotion}/>
            </div>
            </MotionConfig>
        );
    }
}
