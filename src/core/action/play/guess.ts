"use server"

import isLoggedIn from "@/core/util/auth-util";
import { post } from "@/core/action/http/post";

export async function guess(date: string, book: string, chapter: string, passageId: string) {
    const response = await fetch(`${process.env.SVC_PASSAGE}/guess/${date}/${book}/${chapter}`, {
        method: "GET"
    });

    const closeness = await response.json();

    const updatedGuess = {
        book,
        chapter,
        distance: closeness.distance,
        percentage: closeness.percentage,
        closeness
    }

    if (await isLoggedIn()) {
        await post(`${process.env.SVC_USER}/state/guess/${passageId}`, updatedGuess)
    }

    return updatedGuess;
}