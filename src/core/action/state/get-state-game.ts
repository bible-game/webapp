"use server"

import { GameState } from "@/core/model/state/game-state";
import { getToken } from "@/core/util/auth-util";

export async function getGameState(): Promise<Map<number,GameState>> {
    const url = `${process.env.SVC_USER}/state/game`;

    const headers = { authorization: `Bearer ${await getToken()}`};
    const response = await fetch(url, { method: "GET", headers });
    const states: GameState[] = await response.json();

    return new Map(states.map(state => [state.passageId, state]));
}