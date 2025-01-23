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
    const segments = passage.match(/[\s\S]{1,500}/g)!!
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