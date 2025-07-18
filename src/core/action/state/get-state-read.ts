"use server"

import getReadKey, { ReadState } from "@/core/model/state/read-state";
import {getToken} from "@/core/util/auth-util";

export async function getReadState(): Promise<Map<string,ReadState>> {
    const url = `${process.env.SVC_USER}/state/read`;

    const headers = { authorization: `Bearer ${await getToken()}`};
    const response = await fetch(url, { method: "GET", headers });
    const states: ReadState[] = await response.json();

    return new Map(states.map(state => [getReadKey(state), state]));
}