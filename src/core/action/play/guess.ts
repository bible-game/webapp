"use server"

import isLoggedIn from "@/core/util/auth-util";
import { post } from "@/core/action/http/post";

/**
 * Saves a scored guess against a logged-in user; nothing for anyone else, whose device keeps the only copy. Guesses are
 * scored in the browser (app/play/[game]/score.ts), from the Bible's structure the app ships with
 */
export async function saveGuess(passageId: number, guess: any, expectedUserId?: string): Promise<void> {
    if (await isLoggedIn()) {
        await post(`/state/guess/${passageId}`, guess, expectedUserId);
    }
}
