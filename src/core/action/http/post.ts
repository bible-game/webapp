"use server"

import { auth } from "@clerk/nextjs/server";
import { getToken } from "@/core/util/auth-util";

/** Fixed user-service destinations prevent a caller from sending a bearer token to an arbitrary URL. */
export async function post(path: string, body: any, expectedUserId?: string): Promise<any> {
    if (!/^\/state\/(read|review|guess\/[1-9]\d*)$/.test(path)) return undefined;
    const session = await auth();
    if (!session.isAuthenticated || !expectedUserId || session.userId !== expectedUserId) return undefined;
    const token = await getToken();
    if (!token) return undefined;
    try {
        const response = await fetch(`${process.env.SVC_USER}${path}`, {
            method: 'POST', headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body), cache: 'no-store',
        });
        return response.ok ? await response.json() : undefined;
    } catch { return undefined; } // The caller keeps its local copy for a later merge.
}
