"use client"

import Menu from "@/app/play/[game]/menu";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Passage } from "@/core/model/passage";
import { DateValue, getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";
import Action from "@/app/play/[game]/action";
import { CheckIcon } from "@heroui/shared-icons";
import { GameStatesService } from "@/core/service/game-states-service";
import Guesses from "@/app/play/[game]/guesses";
import Confetti from "@/core/component/confetti";
import Treemap from "@/app/play/[game]/treemap";
import moment from "moment/moment";
import {redirect} from "next/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Game Component
 * @since 13th May 2025
 */
export default function Game(props: any) {
    if (props.game == 'today') {
        redirect(`/play/${moment(new Date()).format('YYYY-MM-DD')}`);
    }

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
    const [confetti, setConfetti] = useState(false)

    useEffect(() => {
        if (confetti) setConfetti(false);

        if (typeof window !== "undefined") {
            loadState();
        }
    }, [stars]);

    function loadState() {
        const state = GameStatesService.getStateForDate(props.game)
        setGuesses(state.guesses)
        setStars(state.stars || 0)
        setPlaying(state.playing)
        GameStatesService.initCompletion(props.bible.testaments);
        setState(state);
    }

    function selectBook(item: string, disabled?: boolean): void {
        if (disabled) return;

        selected.book = item;

        const chapters = [];
        const numChapters = allBooks!!.find((book: any) => book.name === item).chapters;
        for (let i = 1; i <= numChapters; i++) chapters.push({ name: i.toString() });

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

    function addGuess(closeness: any) {
        const updatedGuesses = [
            ...guesses,
            {
                book: selected.book,
                bookKey: allBooks.find((bk: any) => bk.name == selected.book).key,
                chapter: selected.chapter,
                closeness
            }
        ]

        setGuesses(updatedGuesses);

        if (selected.book == passage.book) {
            setBook(passage.book);
            setBookFound(<CheckIcon className="text-lg text-green-200" />);
        }
        if (selected.chapter == passage.chapter) {
            setChapter(passage.chapter);
            setChapterFound(<CheckIcon className="text-lg text-green-200" />);
        }

        if (selected.testament == passage.testament) {
            setTestamentFound(<CheckIcon className="text-lg text-green-200" />);
        }
        if (selected.division == passage.division) {
            setDivisionFound(<CheckIcon className="text-lg text-green-200" />);
        }

        let starResult = 0
        const won = (closeness.distance == 0);
        const limitReached = (updatedGuesses.length >= 5);
        if (won) {
            GameStatesService.updateCompletion(false, selected.book, parseInt(selected.chapter));
            setConfetti(true);
        }
        if (won || limitReached) {
            setPlaying(false);
            starResult = won ? 5 + 1 - updatedGuesses.length : 0;
        }
        setStars(starResult)
        GameStatesService.setStateForDate(starResult, updatedGuesses, !(won || limitReached), props.game)
    }

    // fixme :: behaviour not correct
    function clearSelection(): void {
        selected.testament = '';
        selected.division = '';
        selected.book = '';
        selected.chapter = '';
    }

    function isExistingGuess() {
        return guesses.map(guess => guess.book+guess.chapter)
            .includes(selected.book+selected.chapter);
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

    if (isLoading) return <div>Loading...</div>
    else {
        passage.division = props.divisions.find((div: any) => div.books.some((book: any) => book.name == passage.book)).name;
        passage.testament = props.bible.testaments.find((test: any) => test.divisions.some((div: any) => div.name == passage.division)).name;

        return (
            <>
                <Treemap passage={passage} select={select} bookFound={bookFound} divFound={divisionFound} testFound={testamentFound} data={testaments} book={book} device={props.device} playing={playing}/>
                <section className="relative z-1 h-full pointer-events-none">
                    <section className="menu-wrapper pointer-events-auto top-[.375rem] relative">
                        <Menu passage={passage} playing={playing} date={props.game} device={props.device}/>
                    </section>
                    <section className="pointer-events-auto absolute bottom-2 sm:bottom-[4.25rem]">
                        <Action passage={passage} playing={playing} stars={stars} isExistingGuess={isExistingGuess} isInvalidGuess={isInvalidGuess} clearSelection={clearSelection} date={props.game} addGuess={addGuess} selected={selected} books={books} bookFound={bookFound} selectBook={selectBook} maxChapter={maxChapter} hasBook={hasBook} selectChapter={selectChapter} chapter={chapter} guesses={guesses}/>
                        <Guesses guesses={guesses} bookFound={bookFound}/>
                    </section>
                    <Confetti fire={confetti}/>
                </section>
            </>
        );
    }
}
