"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { accountStatus, type AccountStatus } from "@/core/auth/account-service";
import { KNOWN_USER_COOKIE, KNOWN_USER_MAX_AGE } from "@/core/util/auth-cookies";

export async function prepareAccount(expectedUserId: string): Promise<AccountStatus> {
    const session = await auth();
    if (!session.isAuthenticated || session.userId !== expectedUserId) return { status: 'signed-out' };
    const result = await accountStatus();
    if (result.status === 'ready') {
        const store = await cookies();
        store.set(KNOWN_USER_COOKIE, '1', { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: KNOWN_USER_MAX_AGE });
        store.delete('token');
        store.delete('sync_pending');
    }
    return result;
}
