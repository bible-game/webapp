"use server"

import React from "react";
import moment from "moment";
import Game from "@/app/game/Game";

async function getPassage(passageId: string) {
    const response = await fetch(`https://bible-api.com/${passageId}`, {
        method: "GET"
    });

    return response.json();
}

export default async function App() {
    const today = moment(new Date()).format('dddd Do MMMM YYYY');
    const book = 'Mark';
    const chapter = '5';
    const passage = (await getPassage(`${book}+${chapter}:5-9`))["text"];

    return (
        <Game
            today={today}
            book={book}
            chapter={chapter}
            passage={passage}
        />
    );
}

// const bible: any = {
//     'Genesis': 50,
//     'Exodus': 40,
//     'Leviticus': 27,
//     'Number': 36,
//     'Deuteronomy': 34,
//     'Joshua': 24,
//     'Judges': 21,
//     'Ruth': 4,
//     '1 Samuel': 31,
//     '2 Samuel': 24,
//     '1 Kings': 22,
//     '2 Kings': 25,
//     '1 Chronicles': 29,
//     '2 Chronicles': 36,
//     'Ezra': 10,
//     'Nehemiah': 13,
//     'Esther': 10,
//     'Job': 42,
//     'Psalms': 150,
//     'Proverbs': 31,
//     'Ecclesiastes': 12,
//     'Song of Solomon': 8,
//     'Isaiah': 66,
//     'Jeremiah': 52,
//     'Lamentations': 5,
//     'Ezekiel': 48,
//     'Daniel': 12,
//     'Hosea': 14,
//     'Joel': 3,
//     'Amos': 9,
//     'Obadiah': 1,
//     'Jonah': 4,
//     'Micah': 7,
//     'Nahum': 3,
//     'Habakkuk': 3,
//     'Zephaniah': 3,
//     'Haggai': 2,
//     'Zechariah': 3,
//     'Malachi': 4,
//     'Mathew': 28,
//     'Mark': 16,
//     'Luke': 24,
//     'John': 21,
//     'Acts': 28,
//     'Romans': 16,
//     '1 Corinthians': 16,
//     '2 Corinthians': 13,
//     'Galatians': 6,
//     'Ephesians': 6,
//     'Philippians': 4,
//     'Colossians': 4,
//     '1 Thessalonians': 5,
//     '2 Thessalonians': 3,
//     '1 Timothy': 6,
//     '2 Timothy': 4,
//     'Titus': 3,
//     'Philemon': 1,
//     'Hebrews': 13,
//     'James': 5,
//     '1 Peter': 5,
//     '2 Peter': 3,
//     '1 John': 5,
//     '2 John': 1,
//     '3 John': 1,
//     'Jude': 1,
//     'Revelation': 22
// };
