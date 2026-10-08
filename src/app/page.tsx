"use server"

import Landing from "@/app/landing";
import getUserInfo, { UserInfo } from "@/core/action/user/get-user-info";
import { getGameState } from "@/core/action/state/get-state-game";
import { GameState } from "@/core/model/state/game-state";
import isLoggedIn from "@/core/util/auth-util";

export default async function Page() {
    let info: UserInfo | undefined;
    let state: Map<number, GameState> | undefined;
    if (await isLoggedIn()) {
        [info, state] = await Promise.all([getUserInfo(), getGameState().catch(() => undefined)]);
    }

    return <Landing info={info} state={state}/>
}
