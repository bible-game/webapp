"use server"

import { cookies, headers } from "next/headers";
import HomeHost from "@/app/home/home-host";
import getUserInfo, { UserInfo } from "@/core/action/user/get-user-info";
import isLoggedIn, { isKnownUser } from "@/core/util/auth-util";
import getDaily from "@/core/action/play/get-daily";
import { getGameState } from "@/core/action/state/get-state-game";
import { TIMEZONE_COOKIE, todayIn } from "@/core/util/timezone";
import { GameState } from "@/core/model/state/game-state";
import { Passage } from "@/core/model/play/passage";
import bible from "@/core/config/bible.json";

const flatten = (group: any[], subgroup: string) => group.flatMap(item => item[subgroup]);

/**
 * Today's date where the visitor is, as the middleware works it out for /play/today: the browser's timezone, else
 * Vercel's guess from the IP; none without either, and the browser works it out itself
 */
async function today(): Promise<string | undefined> {
    const timeZone = (await cookies()).get(TIMEZONE_COOKIE)?.value ?? (await headers()).get('x-vercel-ip-timezone');
    return timeZone ? todayIn(decodeURIComponent(timeZone)) : undefined;
}

/** The home page: today's game with the landing over it (home/home-host.tsx), so it loads what the Play page loads */
export default async function Page() {
    const loggedIn = await isLoggedIn();
    const date = await today();
    const [info, passage, state]: [UserInfo | undefined, Passage | undefined, Map<number, GameState> | undefined] = await Promise.all([
        loggedIn ? getUserInfo() : undefined,
        date ? getDaily(date) : undefined,
        loggedIn ? getGameState() : undefined,
    ]);
    const known = !info && await isKnownUser();

    const divisions = flatten(bible.testaments, 'divisions');
    const books = flatten(divisions, 'books');
    const device = (await headers()).get('x-device-type');
    const played = passage ? state?.get(passage.id) : undefined;

    return <HomeHost today={date} bible={bible} divisions={divisions} books={books} device={device} passage={passage}
                     played={played} loggedIn={loggedIn} info={info} known={known}/>;
}
