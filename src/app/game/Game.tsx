"use client"

import React from "react";
import moment from "moment";
import Selection from "@/app/game/selection/Selection";

const Game = (props: any) => {
    let stars = 5;
    const whichBook = `⬅️ ${props.passage.division}`
    const whichChapters = `⬅️ ${props.passage.book}, ${props.passage.division}`

    const divisions: any = [
        'theLaw',
        'history',
        'poetry',
        'majorProphets',
        'minorProphets',
        'gospels',
        'earlyChurch',
        'paulineEpistles',
        'generalEpistles',
        'prophecy'
    ];
    const books: any = [
        'joshua', 'judges', 'ruth', '1samuel', '2samuel', 'nehemiah'
    ];
    const chapters: any = [
        '1-2', '3-4', '5-6', '7-10', '11-13'
    ];
    const selectDivision = <Selection selection="Which division?" options={divisions} guess={(option: any): any => guess(option)}/>
    const selectBook = <Selection selection={whichBook} options={books} guess={(option: any): any => guess(option)}/>
    const selectChapters = <Selection selection={whichChapters} options={chapters} guess={(option: any): any => guess(option)}/>

    const today = moment(new Date()).format('dddd Do MMMM YYYY');
    const [division, setDivision] = React.useState('division');
    const [book, setBook] = React.useState('book');
    const [chapter, setChapter] = React.useState('chapters');
    const [score, setScore] = React.useState(5);
    const [selection, setSelection] = React.useState(selectDivision);

    let stage = 'DIVISION';

    function guess(option: any) {
        if (stage == 'DIVISION') {
            if (option == props.passage.division) {
                setDivision(option + ' ✅');
                setSelection(selectBook);
                stage = 'BOOK';
            } else {
                stars--;
                setScore(stars > 0 ? stars : 0);
            }
        } else if (stage == 'BOOK') {
            if (option == props.passage.book) {
                setBook(option + ' ✅');
                setSelection(selectChapters);
                stage ='CHAPTERS';
            } else {
                stars--;
                setScore(stars > 0 ? stars : 0);
            }

        } else if (stage == 'CHAPTERS') {
            if (option == props.passage.chapters) {
                setChapter(option + ' ✅');
                setSelection(<></>);
            } else {
                stars--;
                setScore(stars > 0 ? stars : 0);
            }

        }
    }

    // TODO :: need to have a rethink about the hidden...

    return <main>
        <section>
            <h1>{today}</h1>
            <div className="panel">
                <p className="w-full text-center text-medium">{props.passage.summary}</p>
            </div>
            <div className="flex justify-around gap-1 mt-8 mb-16">
                <div><p className="underline">{division}</p></div>
                <div><p className="underline">{book}</p></div>
                <div><p className="underline">{chapter}</p></div>
            </div>
        </section>
        <section className="mb-16">
            {selection}
        </section>
        <section className="absolute bottom-[8rem] flex justify-around">
            <div>{[...Array(score)].map(() => <span className="p-4 text-[2rem]">⭐</span>)}</div>
        </section>
    </main>
}

export default Game;