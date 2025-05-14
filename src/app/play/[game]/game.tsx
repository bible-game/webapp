"use client"

import Menu from "@/app/play/[game]/menu";
import React, {useEffect} from "react";
import useSWR from "swr";
import { Passage } from "@/core/model/passage";
import Display from "@/app/play/[game]/display/display";
import { DateValue, getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";
import Action from "@/app/play/[game]/action";
import { CheckIcon } from "@heroui/shared-icons";
import { GameStatesService } from "@/core/service/game-states-service";
import Guesses from "@/app/play/[game]/guesses";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Game Component
 * @since 13th May 2025
 */
export default function Game(props: any) {
    const { data, error, isLoading } = useSWR(`${process.env.SVC_PASSAGE}/daily/${props.game}`, fetcher);
    const passage = data as Passage;

    const [playing, setPlaying] = React.useState(true);
    const [guesses, setGuesses] = React.useState([] as any[]); // question :: apply type?
    const [testaments, setTestaments] = React.useState(props.bible.testaments);
    const [divisions, setDivisions] = React.useState(props.divisions);
    const [books, setBooks] = React.useState(props.books);
    const [allBooks, setAllBooks] = React.useState(props.books);
    const [allDivisions, setAllDivisions] = React.useState(props.divisions);
    const [chapters, setChapters] = React.useState([] as any);
    const [selected, setSelected] = React.useState({} as Passage);
    const [book, setBook] = React.useState('');
    const [chapter, setChapter] = React.useState('');
    const [testamentFound, setTestamentFound] = React.useState(false as any);
    const [divisionFound, setDivisionFound] = React.useState(false as any);
    const [bookFound, setBookFound] = React.useState(false as any);
    const [chapterFound, setChapterFound] = React.useState(false as any);
    const [dates, setDates] = React.useState(data);
    const [date, setDate] = React.useState<DateValue>(parseDate(TODAY(getLocalTimeZone()).toString()));
    const [hasBook, setHasBook] = React.useState(false);
    const [maxChapter, setMaxChapter] = React.useState(0);
    const [stars, setStars] = React.useState(0);
    const [state, setState] = React.useState({} as any);

    useEffect(() => {
        if (typeof window !== "undefined") {
            loadState();
        }
    }, []);

    function loadState() {
        const state = GameStatesService.getStateForDate(props.game)
        setGuesses(state.guesses)
        setStars(state.stars || 0)
        setPlaying(state.playing)
        GameStatesService.initCompletion();
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
    }

    function addGuess(closeness: any) {
        const updatedGuesses = [
            ...guesses,
            {
                book: selected.book,
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
        if (won) GameStatesService.updateCompletion(selected.book, parseInt(selected.chapter), false)
        if (won || limitReached) {
            setPlaying(false);
            if (!limitReached) {
                starResult = 5 + 1 - updatedGuesses.length
            }
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

    if (isLoading) return <div>Loading...</div>
    else {
        passage.division = props.divisions.find((div: any) => div.books.some((book: any) => book.name == passage.book)).name;
        passage.testament = props.bible.testaments.find((test: any) => test.divisions.some((div: any) => div.name == passage.division)).name;

        return (
            <>
                <Menu passage={passage} playing={playing} date={props.game}/>
                <Display passage={passage} select={selectBook} bookFound={bookFound} divFound={divisionFound} testFound={testamentFound}/>
                <Action passage={passage} playing={playing} stars={stars} isExistingGuess={isExistingGuess} clearSelection={clearSelection} date={props.game} addGuess={addGuess} selected={selected} books={books} bookFound={bookFound} selectBook={selectBook} maxChapter={maxChapter} hasBook={hasBook} selectChapter={selectChapter} chapter={chapter} guesses={guesses}/>
                <Guesses guesses={guesses}/>
            </>
        );
    }
}
