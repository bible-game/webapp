"use client"

import Display from "@/app/game/display/Display";
import React, { useEffect } from "react";
import Text from "@/app/game/text/Text";
import _ from "lodash";
import moment from "moment";
import { useDisclosure } from "@nextui-org/react";
import { CheckIcon } from "@heroui/shared-icons";
import { Toaster } from "react-hot-toast";
import { getLocalTimeZone, today as TODAY, CalendarDate, parseDate, DateValue } from "@internationalized/date";
import Background from "@/core/component/background";
import Menu from "@/core/component/menu";
import Action from "@/app/game/action/Action";
import Guesses from "@/app/game/guess/Guesses";

const Game = (props: any) => {
    const [today, setToday] = React.useState(moment(new Date()).format('YYYY-MM-DD'));
    const [passage, setPassage] = React.useState({} as any); // question :: apply type?
    const [playing, setPlaying] = React.useState(true);




    const [guesses, setGuesses] = React.useState([] as any[]); // question :: apply type?
    const [testaments, setTestaments] = React.useState(props.bible.testaments);
    const [divisions, setDivisions] = React.useState([] as any[]);
    const [books, setBooks] = React.useState([] as any[]);
    const [allBooks, setAllBooks] = React.useState([] as any[]);
    const [allDivisions, setAllDivisions] = React.useState([] as any[]);
    const [chapters, setChapters] = React.useState([] as any);
    const [selected, setSelected] = React.useState({} as {testament: string, division: string, book: string, chapter: string});
    const [book, setBook] = React.useState('');
    const [chapter, setChapter] = React.useState('');
    const [testamentFound, setTestamentFound] = React.useState(false as any);
    const [divisionFound, setDivisionFound] = React.useState(false as any);
    const [bookFound, setBookFound] = React.useState(false as any);
    const [chapterFound, setChapterFound] = React.useState(false as any);
    const [reading, setReading] = React.useState(false);
    const [dates, setDates] = React.useState(props.dates);
    const [date, setDate] = React.useState<DateValue>(parseDate(TODAY(getLocalTimeZone()).toString()));
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [hasBook, setHasBook] = React.useState(false);
    const [maxChapter, setMaxChapter] = React.useState(0);
    const [stars, setStars] = React.useState(0);
    const [result, setResult] = React.useState("");

    function retrievePassage(date = today) {
        fetch(`${process.env.SVC_PASSAGE}/daily/${date}`, { method: "GET" })
            .then((response) => {
                response.json().then((data) => {
                    data.division = divisions.find((div: any) => div.books.some((book: any) => book.name == data.book)).name;
                    data.testament = props.bible.testaments.find((test: any) => test.divisions.some((div: any) => div.name == data.division)).name;
                    setPassage(data);
                });
            });
    }

    useEffect(() => {
        if (!passage.book) { // fixme :: hack
            flattenDivisions();
            flattenBooks();
            retrievePassage();
        }
    })

    function selectTestament(item: string): void {
        selected.testament = item;

        setDivisions(testaments.find(
            (test: any) => test.name === item
        ).divisions);
    }

    function flattenDivisions() {
        const divisions = [];
        for (const test of testaments) {
            for (const div of test.divisions) divisions.push(div);
        }
        setDivisions(divisions);
        setAllDivisions(divisions);
    }

    function flattenBooks() {
        const books = [];
        for (const div of divisions) {
            for (const book of div.books) {
                books.push(book);
            }
        }
        setBooks(books);
        setAllBooks(books);
    }

    function selectDivision(item: string): void {
        selected.division = item;

        setBooks(allDivisions!!.find(
            (div: any) => div.name === item
        ).books);

        const testament = testaments.find((test: any) => test.divisions.some((div: any) => div.name == item));
        selectTestament(testament.name);
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

        const won = (closeness.distance == 0);
        const limitReached = (updatedGuesses.length == 5);
        if (won || limitReached) {
            setPlaying(false);
            if (limitReached) {
                setStars(0);
            } else setStars(5 + 1 - updatedGuesses.length);

            if (won) {
                setResult(`${'⭐'.repeat(5 + 1 - updatedGuesses.length)}
https://bible.game
${moment(new CalendarDate(parseInt(today.split('-')[0]), parseInt(today.split('-')[1]) - 1, parseInt(today.split('-')[2]))).format('Do MMMM YYYY')}`);

            } else {
                const bestGuess: any = guesses.reduce(function(prev: any, current: any) {
                    if (+current.closeness.percentage > +prev.closeness.percentage) return current
                    else return prev;
                }).closeness;

                setResult(`📖 ${Intl.NumberFormat("en", { notation: "compact" }).format(bestGuess.distance)}
https://bible.game
${moment(new CalendarDate(parseInt(today.split('-')[0]), parseInt(today.split('-')[1]) - 1, parseInt(today.split('-')[2]))).format('Do MMMM YYYY')}`);

            }
        }
    }

    // fixme :: behaviour not correct
    function clearSelection(): void {
        selected.testament = '';
        selected.division = '';
        selected.book = '';
        selected.chapter = '';
    }

    function openReading() {
        setReading(true);

        onOpen();
    }

    function isExistingGuess() {
        return guesses.map(guess => guess.book+guess.chapter)
            .includes(selected.book+selected.chapter);
    }

    function changeDate(date: string = _.sample(dates)): void {
        setToday(date!);
        setDate(parseDate(moment(date).format('YYYY-MM-DD').toString()));

        setPlaying(true);
        setTestamentFound(false);
        setDivisionFound(false);
        setBookFound(false);
        setChapterFound(false);
        setGuesses([]);
        setBook('Book?');
        setChapter('Chapter?');

        retrievePassage(date!);
        clearSelection();
    }

    return <main>
        <Toaster position="bottom-right"/>
        {reading ? <Text isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => setReading(false)} today={today} passage={passage}/> :
            <>
                <Background />
                <Menu passage={passage} date={date} playing={playing} changeDate={changeDate} />
                <Display select={selectBook} bookFound={bookFound} divFound={divisionFound} testFound={testamentFound} passage={passage}/>
                <Action playing={playing} openReading={openReading} result={result} stars={stars} isExistingGuess={isExistingGuess} clearSelection={clearSelection} today={today} addGuess={addGuess} selected={selected} books={books} bookFound={bookFound} selectBook={selectBook} maxChapter={maxChapter} hasBook={hasBook} selectChapter={selectChapter} chapter={chapter}/>
                <Guesses guesses={guesses}/>
            </>
        }
    </main>
}


export default Game;