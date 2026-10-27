"use server"

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { KNOWN_USER_COOKIE } from "@/core/util/auth-cookies";

/**
 * Authentication-related Utilities
 * @since 24th June 2025
 */

/**
 * Determines if the user has a validly signed auth token. The user service may still reject it (after a password
 * reset), so the calls that use it treat a 401 as logged out rather than failing
 */
export default async function isLoggedIn(): Promise<boolean> {
    try {
        const token = await getToken();
        if (token) {
            const { payload } = await jwtVerify(token, await getSecret());
            return !!payload.sub;
        }
    } catch (e) {
        console.error(e);
    }

    return false;
}

/** Return the base64-encoded signing secret */
export async function getSecret(): Promise<Uint8Array> {
    return new TextEncoder().encode(process.env.SIGNING_SECRET);
}

/** Returns the auth token if it exists */
export async function getToken(): Promise<string | null> {
    const cookieStore: ReadonlyRequestCookies = await cookies();
    const cookie: RequestCookie | undefined = cookieStore.get('token');

    return cookie ? cookie.value : null;
}

/** Returns the id of a logged-in user */
export async function getUserId(): Promise<string | undefined> {
    const token = await getToken();
    if (token) {
        const {payload} = await jwtVerify(token, await getSecret());
        return payload.sub;
    } else {
        return undefined;
    }
}

/** Determines if this device has logged in before (the user may now be logged out) */
export async function isKnownUser(): Promise<boolean> {
    const cookieStore: ReadonlyRequestCookies = await cookies();
    return cookieStore.has(KNOWN_USER_COOKIE);
}