"use server"

import Background from "@/app/background";
import Navigation from "@/app/navigation";
import { Toaster } from "react-hot-toast";

import React from "react";
import Game from "@/app/play/[game]/game";
import { headers } from "next/headers";

async function get(url: string): Promise<any> {
    const response = await fetch(url, {method: "GET"});
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
export default async function Play({params}: { params: Promise<{ game: string }> }) {
    const headersList = await headers();
    const device = headersList.get('x-device-type');

    const { game } = await params;
    const bible = await get(`${process.env.SVC_PASSAGE}/config/bible`);

    const divisions = flat(bible.testaments, 'divisions');
    const books = flat(divisions, 'books');

    return (
        <>
            <Background/>
            <main className="w-full">
                <Toaster position="bottom-right"/>
                <Game game={game} bible={bible} divisions={divisions} books={books} device={device}/>
            </main>
            <Navigation stats={true} read={true}/>
        </>
    );

}