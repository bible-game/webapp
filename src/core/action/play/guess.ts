"use server"

import isLoggedIn from "@/core/util/auth-util";
import { post } from "@/core/action/http/post";
import { Passage}  from "@/core/model/play/passage";

export async function guess(date: string, book: string, chapter: string, passage: Passage) {
    const response = await fetch(`${process.env.SVC_PASSAGE}/guess/${date}/${book}/${chapter}`, {
        method: "GET"
    });

    const closeness = await response.json();

    const updatedGuess = {
        book,
        chapter,
        distance: closeness.distance,
        percentage: closeness.percentage,
        closeness,
        passageBook: passage.book,
        passageChapter: passage.chapter
    }

    if (await isLoggedIn()) {
        console.log(passage.id)
        await post(`${process.env.SVC_USER}/state/guess/${passage.id}`, updatedGuess)
    }

    return updatedGuess;
}