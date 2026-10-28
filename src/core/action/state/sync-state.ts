"use server"

import { cookies } from "next/headers";
import { getToken } from "@/core/util/auth-util";
import { SYNC_PENDING_COOKIE } from "@/core/util/sync-cookie";

export interface SyncBody {
    games: any[];
    reads: any[];
    reviews: any[];
}

/**
 * Merges the games, reads and reviews recorded on this device while logged out into the user's account.
 * Runs from the browser after log-in, so it never holds up the redirect. Returns whether the account took the state: a
 * server or network failure leaves the pending cookie for the next page to try again, while a missing token or a
 * rejected request gives up until the next log-in.
 */
export async function syncState(body: SyncBody): Promise<boolean> {
    const cookieStore = await cookies();
    const token = await getToken();
    if (!token) {
        cookieStore.delete(SYNC_PENDING_COOKIE);
        return false;
    }
    if (!body.games.length && !body.reads.length && !body.reviews.length) {
        cookieStore.delete(SYNC_PENDING_COOKIE);
        return true;
    }

    try {
        const response = await fetch(`${process.env.SVC_USER}/state/sync`, {
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        // Only a server or network failure is worth retrying: a rejected sync (4xx) would be rejected again
        if (response.status < 500) cookieStore.delete(SYNC_PENDING_COOKIE);
        if (!response.ok) console.error(`State sync failed: ${response.status} ${response.statusText}`);
        return response.ok;
    } catch (error: any) {
        console.error(`Error when syncing state: ${error.message}`);
        return false;
    }
}
