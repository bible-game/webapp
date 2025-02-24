"use server"

import React from "react";
import Game from "@/app/game/Game";

type Passage = {
    book: string
    chapter: number
    title: string
}

async function getBibleConfig(): Promise<any> {
    return fetch(`${process.env.SVC_PASSAGE}/config/bible`, { method: "GET" })
        .then((response) => {
            return response.json()
        });
}

async function getHistoricDates(): Promise<any> {
    return fetch(`${process.env.SVC_PASSAGE}/daily/history`, { method: "GET" })
        .then((response) => {
            return response.json()
        });
}

export default async function Page() {
    return <Game bible={await getBibleConfig()} dates={await getHistoricDates()} />
}