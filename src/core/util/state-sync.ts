"use client"

import { StateUtil } from "@/core/util/state-util";
import { isSyncPending } from "@/core/util/sync-cookie";
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
        const states = (entries: [any, any][]) => entries.map(([, state]) => state);
        // With nothing to send, the action only clears the pending cookie
        const done = await syncState({ games: states(unsynced.games), reads: states(unsynced.reads), reviews: states(unsynced.reviews) });
        if (done) StateUtil.markSynced(unsynced);
    } catch (e) {
        console.error(e);
    } finally {
        syncing = false;
    }
}
