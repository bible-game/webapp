import { KNOWN_USER_COOKIE, KNOWN_USER_MAX_AGE } from "@/core/util/auth-cookies";
import { clerkMiddleware } from "@clerk/nextjs/server";

import { NextRequest, NextResponse, userAgent } from 'next/server'
import { TIMEZONE_COOKIE, todayIn } from "@/core/util/timezone";

async function routeRequest(request: NextRequest, loggedIn: boolean) {
    const path = request.nextUrl.pathname;
    // The browser's own timezone wins; Vercel's guess from the IP covers a first visit
    const timeZone = request.cookies.get(TIMEZONE_COOKIE)?.value ?? request.headers.get('x-vercel-ip-timezone');
    const today = timeZone ? todayIn(decodeURIComponent(timeZone)) : undefined;

    // A logged-in player skips the landing and goes straight to today's game, before anything
    // renders; everyone else, guests and logged-out accounts alike, gets the landing. /explore shows it to anyone
    if (path == '/' && loggedIn) {
        const url = request.nextUrl.clone();
        url.pathname = today ? `/play/${today}` : '/play/today';
        return NextResponse.redirect(url);
    }

    // Send /play/today straight to the day's date, rather than rendering the page only for it to redirect in the browser.
    // With no timezone to go on, the page redirects
    if (path == '/play/today' && today) {
        const url = request.nextUrl.clone();
        url.pathname = `/play/${today}`;
        return NextResponse.redirect(url);
    }

    const { device } = userAgent(request);
    const type = device.type ?? 'desktop';

    const response = NextResponse.next()
    response.headers.append('x-device-type', type)

    return response
}

// Clerk leaves routes public; keep guest play and the existing routing behaviour.
export default clerkMiddleware(async (auth, request) => {
    const loggedIn = (await auth()).isAuthenticated;
    const response = await routeRequest(request, loggedIn);
    if (loggedIn && !request.cookies.has(KNOWN_USER_COOKIE)) {
        response.cookies.set(KNOWN_USER_COOKIE, '1', { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: KNOWN_USER_MAX_AGE });
    }
    return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
