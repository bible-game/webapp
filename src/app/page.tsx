"use server"

import React from "react";
import moment from "moment";
import Game from "@/app/game/Game";
import { promises as fs } from 'fs';

async function getPassage() {
    const response = await fetch(`${process.env.passageService}/daily`, {
        method: "GET"
    });

    return response.json();
}

function paginate(passage: string) {
    const remaining = (segment: string) => {
        const sentences = segment.split(".");
        return sentences[sentences.length - 1];
    }

    const pages = new Map();
    const segments = passage.match(/[\s\S]{1,1000}/g)!!
    let head = ""; let tail = "";

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const lastCharacter = segment.substring(segment.length - 1);

        const last: boolean = i == segments.length - 1;
        tail = last ? "" : lastCharacter == "." ? ".." : "...";

        const page = i + 1;
        const content = `${head}${segment}${tail}`
        pages.set(page, content);

        const first: boolean = i == 0;
        head = first ? "" : lastCharacter == "." ? "" : remaining(segment);
        tail = "";
    }

    return pages
}

export default async function App() {
    const file: any = await fs.readFile(process.cwd() + '/../deployment/configuration/bible.json', 'utf8');
    const bible: any = JSON.parse(file);

    const today = moment(new Date()).format('dddd Do MMMM YYYY');
    const passage = await getPassage();

    return (
        <Game
            today={today}
            book={passage['book']}
            chapter={passage['chapter']}
            title={passage['title']}
            passage={paginate(passage['text'])}
            bible={bible.books}
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
