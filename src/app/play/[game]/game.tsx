"use client"

import Summary from "@/app/play/[game]/summary";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Passage } from "@/core/model/play/passage";
import { DateValue, getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";
import Action from "@/app/play/[game]/action";
import { CheckIcon } from "@heroui/shared-icons";
import Guesses from "@/app/play/[game]/guesses";
import Confetti from "@/core/component/confetti";
import Treemap from "@/app/play/[game]/map/treemap";
import moment from "moment/moment";
import PopUp from "./pop-up";
import { redirect } from "next/navigation";
import * as Hammer from 'hammerjs';
import { Spinner } from "@heroui/react";
import { StateUtil } from "@/core/util/state-util";
import { GameState } from "@/core/model/state/game-state";
import { toast } from "react-hot-toast";
import { Button } from "@heroui/button";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Game Component
 * @since 13th May 2025
 */
export default function Game(props: any) {
    if (props.game == 'today') {
        redirect(`/play/${moment(new Date()).format('YYYY-MM-DD')}`);
    }

    // TODO :: Stanley
    // getConsentState() => return null;
    // const consent = GameStatesService.getConsentState();
    // if (!consent) {
    //     modal.open()
    // }

    const {data, error, isLoading} = useSWR(`${process.env.SVC_PASSAGE}/daily/${props.game}`, fetcher);
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
    const [narrativeHidden, setNarrativeHidden] = useState(true);

    // FixMe :: double-render, just a dev issue like the treemap?
    useEffect(() => {
        if (!props.state) {
            toast.custom((t) => (
                <div
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth="1.25"
                                     stroke={'black'} className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Log-in to keep your data safe
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <Button
                            as={Link}
                            onPress={() => toast.dismiss()}
                            href="/account/log-in"
                            className="bg-white h-full w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            Log In
                        </Button>
                    </div>
                </div>
            ))
        }
    }, [props.state]);

    useEffect(() => {
        if (confetti) setConfetti(false);

        if (typeof window !== "undefined") {
            (window as any).Hammer = Hammer.default;
            //// global.d.ts
            // import type * as HammerType from 'hammerjs';
            //
            // declare global {
            //   interface Window {
            //     Hammer: typeof HammerType;
            //   }
            // }
            /**
             * You can tell TypeScript about window.Hammer by augmenting the global Window type. Create a global.d.ts file in your project root (or anywhere under /types, as long as it's included in your tsconfig.json), and add this:
             */

            if (passage) loadState();
        }
    }, [passage]);

    function loadState() {
        if (props.state)
            StateUtil.setAllGame(props.state);

        if (passage) {
            const state = StateUtil.getGame(passage.id);
            setGuesses(state.guesses)
            setStars(state.stars || 0)
            setPlaying(state.playing)
            setState(state);
        }
    }

    function selectBook(item: string, disabled?: boolean): void {
        if (disabled) return;

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
            setBookFound(<CheckIcon className="text-lg text-green-200"/>);
        }
        if (selected.chapter == passage.chapter) {
            setChapter(passage.chapter);
            setChapterFound(<CheckIcon className="text-lg text-green-200"/>);
        }

        if (selected.testament == passage.testament) {
            setTestamentFound(<CheckIcon className="text-lg text-green-200"/>);
        }
        if (selected.division == passage.division) {
            setDivisionFound(<CheckIcon className="text-lg text-green-200"/>);
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
            passageChapter: passage.chapter
        }
        StateUtil.setGame(state);
    }

    // fixme :: behaviour not correct
    function clearSelection(): void {
        selected.testament = '';
        selected.division = '';
        selected.book = '';
        selected.chapter = '';
    }

    function isExistingGuess() {
        return guesses.map(guess => guess.book + guess.chapter)
            .includes(selected.book + selected.chapter);
    }

    function isInvalidGuess(icon: string) {
        return false;
        // return passage.icon != icon;
    }

    function select(book: any, chapter: any, isBookKey = true) {
        console.log(chapter);
        if (isBookKey) {
            const bookName = allBooks.find((bk: any) => bk.key == book).name;
            if (book) selectBook(bookName);

        } else {
            selectBook(book);
        }
        if (chapter) selectChapter(chapter);
    }

    function toggleNarrative() {
        setNarrativeHidden(!narrativeHidden);
    }

    if (isLoading) return <Spinner color="primary" className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)]"/>
    else {
        passage.division = props.divisions.find((div: any) => div.books.some((book: any) => book.name == passage.book)).name;
        passage.testament = props.bible.testaments.find((test: any) => test.divisions.some((div: any) => div.name == passage.division)).name;

        return (
            <>
                <PopUp />
                <Summary passage={passage} playing={playing}/>
                <Treemap passage={passage} select={select} bookFound={bookFound} divFound={divisionFound}
                         testFound={testamentFound} data={testaments} book={book} device={props.device}
                         narrativeHidden={narrativeHidden}
                         playing={playing}/>
                <Action passage={passage} playing={playing} stars={stars} isExistingGuess={isExistingGuess}
                        isInvalidGuess={isInvalidGuess} clearSelection={clearSelection} date={props.game}
                        addGuess={addGuess} selected={selected} books={books} bookFound={bookFound}
                        selectBook={selectBook} maxChapter={maxChapter} hasBook={hasBook}
                        state={props.state} passageId={passage.id} bible={props.bible}
                        selectChapter={selectChapter} chapter={chapter} guesses={guesses}/>
                <Guesses guesses={guesses} bookFound={bookFound} device={props.device} stars={stars}/>
                <Confetti fire={confetti}/>
            </>
        );
    }
}

