"use client"

import Summary from "@/app/play/[game]/summary";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Passage } from "@/core/model/play/passage";
import type { HierarchyFilter } from "@project-skymap/library";
import { DateValue, getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";
import Action from "@/app/play/[game]/action";
import { CheckIcon } from "@heroui/shared-icons";
import Guesses from "@/app/play/[game]/guesses";
import Confetti from "@/core/component/confetti";
import Treemap, { SKYMAP_MAX_FOV } from "@/app/play/[game]/map/treemap";
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
import samplePassage from "../../../../public/sample.json";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const stubGamePassage: Passage = {
    id: 0,
    title: samplePassage.reference,
    summary: samplePassage.text.split("\n").find(Boolean) ?? samplePassage.reference,
    testament: "",
    division: "",
    book: samplePassage.verses[0].book_name,
    bookKey: samplePassage.verses[0].book_id,
    chapter: samplePassage.verses[0].chapter.toString(),
};

/**
 * Game Component
 * @since 13th May 2025
 */
export default function Game(props: any) {
    if (props.game == 'today') {
        redirect(`/play/${moment(new Date()).format('YYYY-MM-DD')}`);
    }

    const useStubPassage = process.env.USE_STUB_PASSAGE_RESPONSE === "true";
    const {data, error, isLoading} = useSWR(useStubPassage ? null : `${process.env.SVC_PASSAGE}/daily/${props.game}`, fetcher);
    const passage = (useStubPassage ? stubGamePassage : data) as Passage;

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
    const [flyToNodeId, setFlyToNodeId] = useState<string | undefined>(undefined);
    const [activeHierarchyFilter, setActiveHierarchyFilter] = useState<HierarchyFilter | null>(null);
    const [fov, setFov] = useState(SKYMAP_MAX_FOV);
    const passageVisible = fov >= SKYMAP_MAX_FOV - 0.5;

    function getDistanceValue(guess: any): number | undefined {
        return guess?.distance ?? guess?.closeness?.distance;
    }

    function getBookByName(bookName?: string) {
        if (!bookName) return undefined;
        return allBooks.find((candidate: any) => candidate.name === bookName);
    }

    function getBookByKey(bookKey?: string) {
        if (!bookKey) return undefined;
        return allBooks.find((candidate: any) => candidate.key === bookKey);
    }

    function getDivisionByName(divisionName?: string) {
        if (!divisionName) return undefined;
        return allDivisions.find((candidate: any) => candidate.name === divisionName);
    }

    function getTestamentByName(testamentName?: string) {
        if (!testamentName) return undefined;
        return testaments.find((candidate: any) => candidate.name === testamentName);
    }

    function getGuessHierarchy(guess: any) {
        const guessedBook = getBookByKey(guess?.bookKey) ?? getBookByName(guess?.book);
        const guessedDivision = guessedBook
            ? allDivisions.find((division: any) => division.books.some((book: any) => book.key === guessedBook.key))
            : getDivisionByName(guess?.division);
        const guessedTestament = guessedDivision
            ? testaments.find((testament: any) => testament.divisions.some((division: any) => division.name === guessedDivision.name))
            : getTestamentByName(guess?.testament);

        return {
            testament: guessedTestament?.name,
            division: guessedDivision?.name,
            book: guessedBook?.name,
            bookKey: guessedBook?.key,
            chapter: guess?.chapter ? String(guess.chapter) : undefined,
        };
    }

    function buildHierarchyFilter(guess: any, answer: Passage): HierarchyFilter | null {
        if (!answer || getDistanceValue(guess) === 0) {
            return null;
        }

        const guessed = getGuessHierarchy(guess);
        const answerBook = getBookByKey(answer.bookKey) ?? getBookByName(answer.book);
        if (!answerBook) {
            return null;
        }

        if (guessed.testament !== answer.testament) {
            return { testament: answer.testament };
        }

        if (guessed.division !== answer.division) {
            return { testament: answer.testament, division: answer.division };
        }

        return {
            testament: answer.testament,
            division: answer.division,
            bookKey: answerBook.key,
        };
    }

    function applyHierarchySelectionState(filter: HierarchyFilter | null) {
        selected.testament = '';
        selected.division = '';
        selected.book = '';
        selected.chapter = '';

        setBook('');
        setChapter('');
        setHasBook(false);
        setChapters([]);
        setMaxChapter(0);

        if (!filter) {
            setDivisions(allDivisions);
            setBooks(allBooks);
            return;
        }

        const filteredTestament = filter.testament ? getTestamentByName(filter.testament) : undefined;
        const filteredDivisions = filteredTestament ? filteredTestament.divisions : allDivisions;
        setDivisions(filteredDivisions);

        if (!filter.division) {
            setBooks(filteredDivisions.flatMap((division: any) => division.books));
            return;
        }

        const filteredDivision = getDivisionByName(filter.division);
        const filteredBooks = filteredDivision?.books ?? [];
        setBooks(filteredBooks);
        selected.testament = filter.testament ?? '';
        selected.division = filter.division;

        if (!filter.bookKey) {
            return;
        }

        const filteredBook = getBookByKey(filter.bookKey);
        if (!filteredBook) {
            return;
        }

        selected.book = filteredBook.name;
        setHasBook(true);
        setBook(filteredBook.name);
        setBooks([filteredBook]);

        const nextChapters = [];
        for (let chapterIndex = 1; chapterIndex <= filteredBook.chapters; chapterIndex++) {
            nextChapters.push({ name: chapterIndex.toString() });
        }

        setChapters(nextChapters);
        setMaxChapter(filteredBook.chapters);
        const nextChapter = '1';
        selected.chapter = nextChapter;
        setChapter(nextChapter);
    }

    // FixMe :: double-render, just a dev issue like the treemap?
    useEffect(() => {
        if (!props.state && StateUtil.getConsent()) {
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

            if (passage) loadState();
        }
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

    useEffect(() => {
        if (!passage) return;

        const latestGuess = guesses[guesses.length - 1];
        const nextFilter = latestGuess ? buildHierarchyFilter(latestGuess, passage) : null;

        setActiveHierarchyFilter(nextFilter);
        applyHierarchySelectionState(nextFilter);
    }, [allBooks, allDivisions, guesses, passage, testaments]);

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
        newGuess.bookKey = getBookByName(selected.book)?.key;
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
        const won = (getDistanceValue(newGuess) == 0);
        const limitReached = (updatedGuesses.length >= 5);
        if (won) {
            setConfetti(true);
        }
        if (won || limitReached) {
            setPlaying(false);
            starResult = won ? 5 + 1 - updatedGuesses.length : 0;
        }

        setStars(starResult);

        // --- Add this block to set flyToNodeId ---
        let guessedNodeId: string | undefined;
        // Example: If newGuess has bookKey and chapter, construct nodeId
        if (newGuess.bookKey && newGuess.chapter) {
            guessedNodeId = `C:${newGuess.bookKey}:${newGuess.chapter}`;
        } else if (newGuess.bookKey) {
            guessedNodeId = `B:${newGuess.bookKey}`;
        }
        setFlyToNodeId(guessedNodeId);

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

        setTimeout(() => setFlyToNodeId(undefined), 1500); // 1.5 seconds delay
    }

    // fixme :: behaviour not correct
    function clearSelection(): void {
        applyHierarchySelectionState(activeHierarchyFilter);
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

    if (!useStubPassage && isLoading) return <Spinner color="primary" className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)]"/>
    else {
        passage.division = props.divisions.find((div: any) => div.books.some((book: any) => book.name == passage.book)).name;
        passage.testament = props.bible.testaments.find((test: any) => test.divisions.some((div: any) => div.name == passage.division)).name;

        return (
            <div className="absolute inset-0 w-full h-full">
                <Treemap passage={passage} select={select} bookFound={bookFound} divFound={divisionFound}
                         testFound={testamentFound} data={testaments} book={book} device={props.device}
                         narrativeHidden={narrativeHidden}
                         playing={playing}
                         flyToNodeId={flyToNodeId}
                         activeHierarchyFilter={activeHierarchyFilter}
                         onFovChange={setFov}/>

                <div className="relative z-10 w-full h-full pointer-events-none">
                    <div className="flex flex-col items-center pt-8 w-full pointer-events-none">
                        <PopUp />
                    </div>

                    <div className="absolute inset-0 flex items-start justify-center pt-24 sm:pt-28 pointer-events-none">
                        <Summary passage={passage} playing={playing} hidden={!passageVisible}/>
                    </div>

                    <div className="sm:absolute sm:bottom-20 sm:left-[calc(50%-24rem)] sm:w-[48rem] pointer-events-none sm:flex sm:flex-col sm:gap-2">
                        <Guesses guesses={guesses} bookFound={bookFound} device={props.device} stars={stars}/>
                        <Action passage={passage} playing={playing} stars={stars} isExistingGuess={isExistingGuess}
                                isInvalidGuess={isInvalidGuess} clearSelection={clearSelection} date={props.game}
                                addGuess={addGuess} selected={selected} books={books} bookFound={bookFound}
                                selectBook={selectBook} maxChapter={maxChapter} hasBook={hasBook}
                                state={props.state} passageId={passage.id} bible={props.bible}
                                selectChapter={selectChapter} chapter={chapter} guesses={guesses}/>
                    </div>
                    <Confetti fire={confetti}/>
                </div>
            </div>
        );
    }
}
