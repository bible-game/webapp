"use client"

import React from "react";
import moment from "moment";
import Selection from "@/app/game/selection/Selection";

const Game = (props: any) => {
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
        '1-2', '3-4'
    ];
    const selectDivision = <Selection selection="Which division?" options={divisions} guess={(option: any): any => guess(option)}/>
    const selectBook = <Selection selection="Which book?" options={books} guess={(option: any): any => guess(option)}/>
    const selectChapters = <Selection selection="Which chapters?" options={chapters} guess={(option: any): any => guess(option)}/>

    const today = moment(new Date()).format('dddd Do MMMM YYYY');
    const [division, setDivision] = React.useState('division');
    const [book, setBook] = React.useState('book');
    const [chapter, setChapter] = React.useState('chapters');
    const [stars, setStars] = React.useState(5);
    const [selection, setSelection] = React.useState(selectDivision);

    let stage = 'DIVISION';

    function guess(option: any) {
        if (stage == 'DIVISION') {
            if (option == props.passage.division) {
                setDivision(option + ' ✅');
                setSelection(selectBook);
                stage = 'BOOK';
            } else {
                setStars(stars - 1);
            }
        } else if (stage == 'BOOK') {
            if (option == props.passage.book) {
                setBook(option + ' ✅');
                setSelection(selectChapters);
                stage ='CHAPTERS';
            } else {
                setStars(stars - 1);
            }

        } else if (stage == 'CHAPTERS') {
            if (option == props.passage.chapters) {
                setChapter(option + ' ✅');
                setSelection(<></>);
            } else {
                setStars(stars - 1);
            }

        }
    }

    return <main>
        <section>
            <h1>{today}</h1>
            <div className="panel">
                <p className="w-full text-center text-medium">{props.passage.summary}</p>
            </div>
            <div className="flex justify-around gap-1 my-2">
                <div><p className="underline">{division}</p></div>
                <div><p className="underline">{book}</p></div>
                <div><p className="underline">{chapter}</p></div>
            </div>
        </section>
        <section>
            {selection}
        </section>
        <section>
            {[...Array(stars)].map(() =>
                <span className="p-4">⭐</span>
            )}
        </section>
    </main>
}

export default Game;