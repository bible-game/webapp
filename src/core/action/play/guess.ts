"use server"

import isLoggedIn from "@/core/util/auth-util";
import { post } from "@/core/action/http/post";
import { Passage}  from "@/core/model/play/passage";

/** Scores a guess with the passage service and saves it; only for when the browser can't score it itself */
export async function guess(date: string, book: string, chapter: string, passage: Passage) {
    const response = await fetch(`${process.env.SVC_PASSAGE}/guess/${date}/${book}/${chapter}`, {
        method: "GET"
    });

    const closeness = await response.json();
    const updatedGuess = guessOf(book, chapter, closeness, passage);

    await saveGuess(passage.id, updatedGuess);

    return updatedGuess;
}

/** Saves a scored guess against a logged-in user; nothing for anyone else, whose device keeps the only copy */
export async function saveGuess(passageId: number, guess: any): Promise<void> {
    if (await isLoggedIn()) {
        await post(`${process.env.SVC_USER}/state/guess/${passageId}`, guess);
    }
}

/** A guess as the game and the user service hold it */
function guessOf(book: string, chapter: string, closeness: { distance: number, percentage: number }, passage: Passage) {
    return {
        book,
        chapter,
        distance: closeness.distance,
        percentage: closeness.percentage,
        closeness,
        passageBook: passage.book,
        passageChapter: passage.chapter
    }
}
