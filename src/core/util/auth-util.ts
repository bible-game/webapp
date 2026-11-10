import "server-only";

import { auth } from "@clerk/nextjs/server";
import { accountStatus } from "@/core/auth/account-service";
import { cookies } from "next/headers";
import { sessionToken } from "@/core/auth/session-token";
import { KNOWN_USER_COOKIE } from "@/core/util/auth-cookies";

export default async function isLoggedIn(): Promise<boolean> {
    return (await auth()).isAuthenticated;
}

export async function getToken(): Promise<string | null> {
    return sessionToken();
}

/** Rankings and progress continue to use the numeric application ID, not Clerk's subject. */
export async function getUserId(): Promise<string | undefined> {
    const result = await accountStatus();
    return result.status === "ready" ? String(result.info.id) : undefined;
}

export async function isKnownUser(): Promise<boolean> {
    return (await cookies()).has(KNOWN_USER_COOKIE);
}
