"use server"

import React from "react";
import Game from "@/app/game/Game";

type Passage = {
    book: string
    chapter: number
    title: string
}

async function get(path: string): Promise<any> {
    return fetch(`${process.env.SVC_PASSAGE}/${path}`, { method: "GET" })
        .then((response) => {
            return response.json()
        });
}

export default async function Page() {
    return <Game
        bible={await get('config/bible')}
        dates={await get('daily/history')} />
}