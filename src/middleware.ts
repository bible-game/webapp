import { NextRequest, NextResponse, userAgent } from 'next/server'
import { TIMEZONE_COOKIE, todayIn } from "@/core/util/timezone";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    // The browser's own timezone wins; Vercel's guess from the IP covers a first visit
    const timeZone = request.cookies.get(TIMEZONE_COOKIE)?.value ?? request.headers.get('x-vercel-ip-timezone');
    const today = timeZone ? todayIn(decodeURIComponent(timeZone)) : undefined;

    // A logged-in player (auth-cookies.ts's 'token') skips the landing and goes straight to today's game, before anything
    // renders; everyone else, guests and logged-out accounts alike, gets the landing. /explore shows it to anyone
    if (path == '/' && request.cookies.has('token')) {
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
