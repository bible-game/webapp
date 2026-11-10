"use client"

import { StateUtil } from "@/core/util/state-util";
import { StorageUtil } from "@/core/util/storage-util";
import { syncState, type SyncResult } from "@/core/action/state/sync-state";

let running: { scope: string; promise: Promise<SyncResult | 'empty'> } | undefined;

/** Share an in-flight attempt with the joining screen; never acknowledge data in a different account's scope. */
export function syncLocalState(): Promise<SyncResult | 'empty'> {
    const scope = StorageUtil.scopeToken();
    if (running?.scope === scope) return running.promise;
    const owner = StorageUtil.getOwner();
    if (!owner) return Promise.resolve('empty');
    const promise = (async (): Promise<SyncResult | 'empty'> => {
        try {
            const unsynced = StateUtil.getUnsynced();
            if (!unsynced.games.length && !unsynced.reads.length && !unsynced.reviews.length) {
                return 'empty';
            }
            const states = (entries: [any, any][]) => entries.map(([, state]) => state);
            const games = states(unsynced.games).map(game => ({
                ...game, guesses: game.guesses.map((guess: any) => ({ ...guess,
                    passageBook: guess.passageBook ?? game.passageBook, passageChapter: guess.passageChapter ?? game.passageChapter,
                })),
            }));
            const result = await syncState({ games, reads: states(unsynced.reads), reviews: states(unsynced.reviews) }, owner ?? undefined);
            if (StorageUtil.scopeToken() !== scope) return 'signed-out';
            if (result === 'synced') StateUtil.markSynced(unsynced);
            return result;
        } catch {
            return 'retry';
        }
    })();
    running = { scope, promise };
    void promise.finally(() => { if (running?.promise === promise) running = undefined; });
    return promise;
}
