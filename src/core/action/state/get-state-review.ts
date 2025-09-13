"use server"

import { ReviewState } from "@/core/model/state/review-state";
import { getToken } from "@/core/util/auth-util";

export async function getReviewState(): Promise<Map<string,ReviewState>> {
    const url = `${process.env.SVC_USER}/state/review`;

    const headers = { authorization: `Bearer ${await getToken()}`};
    const response = await fetch(url, { method: "GET", headers });
    const states: ReviewState[] = await response.json();

    return new Map(states.map(state => [state.passageKey, state]));
}