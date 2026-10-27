"use server"

import getReadKey, { ReadState } from "@/core/model/state/read-state";
import { getToken } from "@/core/util/auth-util";

export async function getReadState(): Promise<Map<string,ReadState> | undefined> {
    const url = `${process.env.SVC_USER}/state/read`;

    const headers = { authorization: `Bearer ${await getToken()}`};
    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) return undefined; // e.g. 401 once a password reset has ended the session
    const states: ReadState[] = await response.json();

    return new Map(states.map(state => [getReadKey(state), state]));
}