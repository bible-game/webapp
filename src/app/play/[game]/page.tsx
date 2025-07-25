"use server"

import Background from "@/app/background";
import Navigation from "@/app/navigation";
import { Toaster } from "react-hot-toast";

import React from "react";
import Game from "@/app/play/[game]/game";
import { headers } from "next/headers";
import { GameState } from "@/core/model/state/game-state";
import { getGameState } from "@/core/action/state/get-state-game";
import isLoggedIn from "@/core/util/auth-util";
import getUserInfo, {UserInfo} from "@/core/action/user/get-user-info";

async function get(url: string): Promise<any> {
    const response = await fetch(url, {method: "GET"});
    return await response.json();
}

const flatten = (group: any, subgroup: any) => {
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

    const divisions = flatten(bible.testaments, 'divisions');
    const books = flatten(divisions, 'books');

    let info: UserInfo | undefined;
    let state: Map<number,GameState> | undefined;
    if (await isLoggedIn()) {
        state = await getGameState();
        info = await getUserInfo();
    }

    return (
        <>
            <Background/>
            <main className="w-full">
                <Toaster position="bottom-right"/>
                <Game game={game} bible={bible} divisions={divisions} books={books} device={device} state={state}/>
            </main>
            <Navigation stats={true} read={true} authenticated={!!info} displayName={info?.firstname}/>
        </>
    );

}