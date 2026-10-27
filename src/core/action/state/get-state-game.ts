"use server"

import { GameState } from "@/core/model/state/game-state";
import { getToken } from "@/core/util/auth-util";

export async function getGameState(): Promise<Map<number,GameState> | undefined> {
    const url = `${process.env.SVC_USER}/state/game`;

    const headers = { authorization: `Bearer ${await getToken()}`};
    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) return undefined; // e.g. 401 once a password reset has ended the session
    const states: GameState[] = await response.json();

    return new Map(states.map((state: GameState)=> {
        state.guesses.forEach((guess: any) => {
            guess.closeness = {distance: guess.distance, percentage: guess.percentage}
        })
        return [state.passageId, state]
    }));
}