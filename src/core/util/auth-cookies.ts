import { cookies } from "next/headers";

/**
 * Auth Cookie Utilities
 * @since 14th October 2026
 */

/** Lifetime of the auth cookie; must not outlive the JWT (user service `session-timeout-mins`) */
export const AUTH_MAX_AGE = 60 * 60 * 24 * 90;

/** Marks a device that has logged in before, so we can invite (not force) a log-in */
export const KNOWN_USER_COOKIE = 'known_user';
const KNOWN_USER_MAX_AGE = 60 * 60 * 24 * 365;

/** Persists the auth token and flags this device as belonging to a known user */
export async function setAuthCookies(token: string): Promise<void> {
    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === 'production';

    cookieStore.set('token', token, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: AUTH_MAX_AGE });
    cookieStore.set(KNOWN_USER_COOKIE, '1', { secure, sameSite: 'lax', path: '/', maxAge: KNOWN_USER_MAX_AGE });
}

/** Returns a same-origin path to continue to after logging in, defaulting to home */
export function safeNext(next: FormDataEntryValue | null): string {
    const path = typeof next === 'string' ? next : '';
    return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') ? path : '/';
}
