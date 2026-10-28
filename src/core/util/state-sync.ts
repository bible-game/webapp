"use client"

import { StateUtil } from "@/core/util/state-util";
import { clearSyncPending, isSyncPending } from "@/core/util/sync-cookie";
import { syncState } from "@/core/action/state/sync-state";

/**
 * State Sync: merges what was played on this device while logged out into the account, after log-in
 * @since 28th October 2026
 */

let syncing = false;

/** Sends what the account hasn't seen yet, once a log-in has asked for it; only the changes, never the whole history */
export async function syncLocalState(): Promise<void> {
    if (syncing || !isSyncPending()) return;
    syncing = true;

    try {
        const unsynced = StateUtil.getUnsynced();
        if (!unsynced.games.length && !unsynced.reads.length && !unsynced.reviews.length) {
            clearSyncPending();
            return;
        }

        const states = (entries: [any, any][]) => entries.map(([, state]) => state);
        // Guesses saved by the user service don't carry their passage, which the sync requires of every guess
        const games = states(unsynced.games).map((game) => ({
            ...game,
            guesses: game.guesses.map((guess: any) => ({ ...guess, passageBook: guess.passageBook ?? game.passageBook, passageChapter: guess.passageChapter ?? game.passageChapter }))
        }));
        const done = await syncState({ games, reads: states(unsynced.reads), reviews: states(unsynced.reviews) });
        if (done) StateUtil.markSynced(unsynced);
    } catch (e) {
        console.error(e);
    } finally {
        syncing = false;
    }
}
