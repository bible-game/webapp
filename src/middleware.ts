import { NextRequest, NextResponse, userAgent } from 'next/server'
import { TIMEZONE_COOKIE, todayIn } from "@/core/util/timezone";

export async function middleware(request: NextRequest) {
    // Send /play/today straight to the day's date, rather than rendering the page only for it to redirect in the browser.
    // The browser's own timezone wins; Vercel's guess from the IP covers a first visit. With neither, the page redirects.
    if (request.nextUrl.pathname == '/play/today') {
        const timeZone = request.cookies.get(TIMEZONE_COOKIE)?.value ?? request.headers.get('x-vercel-ip-timezone');
        const today = timeZone ? todayIn(decodeURIComponent(timeZone)) : undefined;
        if (today) {
            const url = request.nextUrl.clone();
            url.pathname = `/play/${today}`;
            return NextResponse.redirect(url);
        }
    }

    const { device } = userAgent(request);
    const type = device.type ?? 'desktop';

    const response = NextResponse.next()
    response.headers.append('x-device-type', type)

    return response
}
