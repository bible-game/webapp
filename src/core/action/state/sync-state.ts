"use server"

import { auth } from "@clerk/nextjs/server";
import { getToken } from "@/core/util/auth-util";

export interface SyncBody { games: any[]; reads: any[]; reviews: any[]; }
export type SyncResult = 'synced' | 'retry' | 'signed-out' | 'rejected';

/** The expected Clerk ID binds this device snapshot to its owner even if another tab changes the session. */
export async function syncState(body: SyncBody, expectedUserId?: string): Promise<SyncResult> {
    const session = await auth();
    if (!session.isAuthenticated || !expectedUserId || session.userId !== expectedUserId) return 'signed-out';
    const token = await getToken();
    if (!token) return 'signed-out';
    try {
        const response = await fetch(`${process.env.SVC_USER}/state/sync`, {
            method: 'POST', headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body), cache: 'no-store',
        });
        if (response.ok) return 'synced';
        if (response.status === 401) return 'signed-out';
        if (response.status >= 500 || response.status === 429) return 'retry';
        return 'rejected';
    } catch {
        return 'retry';
    }
}
