"use server"

import Background from "@/app/background";
import Navigation from "@/app/navigation";
import { Toaster } from "react-hot-toast";

import React from "react";
import Game from "@/app/play/[game]/game";

async function get(path: string): Promise<any> {
    const response = await fetch(`${process.env.SVC_PASSAGE}/${path}`, {method: "GET"});
    return await response.json();
}

const flat = (group: any, subgroup: any) => {
    const list = [];
    for (const item of group) {
        for (const subitem of item[subgroup]) list.push(subitem);
    }

    return list;
}

/**
 * Game Play Page
 * @since 12th April 2025
 */
export default async function Play({params}: { params: Promise<{ game: string }>}) {

    const { game } = await params;
    const bible = await get(`config/bible`);

    const divisions = flat(bible.testaments, 'divisions');
    const books     = flat(divisions, 'books');

    if (!game || !bible) return <div>Loading...</div>
    else return (
        <>
            <Background/>
            <main>
                <Toaster position="bottom-right"/>
                <Game game={game} bible={bible} divisions={divisions} books={books}/>
            </main>
            <Navigation stats={true} read={true}/>
        </>
    );

}