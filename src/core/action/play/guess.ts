"use server"

import isLoggedIn from "@/core/util/auth-util";
import { post } from "@/core/action/http/post";

/**
 * Saves a scored guess against a logged-in user; nothing for anyone else, whose device keeps the only copy. Guesses are
 * scored in the browser (app/play/[game]/score.ts), from the Bible's structure the app ships with
 */
export async function saveGuess(passageId: number, guess: any): Promise<void> {
    if (await isLoggedIn()) {
        await post(`${process.env.SVC_USER}/state/guess/${passageId}`, guess);
    }
}
