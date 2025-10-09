"use server"

import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import { getCookie } from "@/core/action/auth/cookie";

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
        if (e instanceof JWTExpired) {
            console.debug("JWT has expired. Attempting to refresh...")
        }
    }

    return false;
}

/** Return the base64-encoded signing secret */
export async function getSecret(): Promise<Uint8Array> {
    return new TextEncoder().encode("Bible-Game secret authentication key - for development use only");
}

/** Returns the auth token if it exists */
export async function getToken(): Promise<string | null> {
    const cookie = await getCookie('token')

    return cookie ? cookie.value : null;
}

/** Returns the id of a logged-in user */
export async function getUserId(): Promise<string | undefined> {
    const token = await getToken();
    if (token) {
        const { payload } = await jwtVerify(token, await getSecret());
        return payload.sub;
    } else {
        return undefined;
    }
}
