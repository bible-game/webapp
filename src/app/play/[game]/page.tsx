"use server"

import React from "react";
import "../play.sass";
import Game from "@/app/play/[game]/game";
import { headers } from "next/headers";
import { GameState } from "@/core/model/state/game-state";
import { getGameState } from "@/core/action/state/get-state-game";
import isLoggedIn, { isKnownUser } from "@/core/util/auth-util";
import getUserInfo, {UserInfo} from "@/core/action/user/get-user-info";
import getBible from "@/core/action/config/get-bible";
import getDaily from "@/core/action/play/get-daily";
import { Passage } from "@/core/model/play/passage";

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

    // The calls are independent, so they run together rather than one after another
    const loggedIn = await isLoggedIn();
    const [bible, passage, state, info]: [any, Passage | undefined, Map<number,GameState> | undefined, UserInfo | undefined] = await Promise.all([
        getBible(),
        game == 'today' ? undefined : getDaily(game), // the browser redirects 'today' to its own date first
        loggedIn ? getGameState() : undefined,
        loggedIn ? getUserInfo() : undefined
    ]);
    const known = !info && await isKnownUser();
    // Only this day's game goes in the page; the rest of the player's games follow it in the background
    const played = passage ? state?.get(passage.id) : undefined;

    const divisions = flatten(bible.testaments, 'divisions');
    const books = flatten(divisions, 'books');

    return (
        <main className="w-full relative z-1">
            <Game game={game} bible={bible} divisions={divisions} books={books} device={device} passage={passage} played={played} loggedIn={loggedIn} info={info} known={known} />
        </main>
    );

}
