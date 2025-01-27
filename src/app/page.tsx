"use server"

import React from "react";
import Game from "@/app/game/Game";
import { promises as fs } from 'fs';

type Passage = {
    book: string
    chapter: number
    title: string
}

export default async function Page() {
    const file: any = await fs.readFile(`${process.cwd()}/${process.env.bibleConfig}`, 'utf8');
    const bible: any = JSON.parse(file);

    return <Game bible={bible} />
}