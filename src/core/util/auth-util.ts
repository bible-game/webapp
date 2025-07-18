"use server"

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Authentication-related Utilities
 * @since 24th June 2025
 */
// export class AuthUtil { }

/** Determines if the user has a valid auth token */
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