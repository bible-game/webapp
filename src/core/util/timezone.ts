/**
 * Timezone Utilities: lets the server work out the player's "today" before anything renders
 * @since 27th October 2026
 */

/** The timezone the browser last reported, so `/play/today` is redirected to the day where the player is */
export const TIMEZONE_COOKIE = 'tz';
const TIMEZONE_MAX_AGE = 60 * 60 * 24 * 365;

/** Records this browser's timezone for the next request */
export function saveTimezone(): void {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timeZone)}; path=/; max-age=${TIMEZONE_MAX_AGE}; samesite=lax`;
}

/** Today's date (YYYY-MM-DD) in the given timezone; none if it isn't one */
export function todayIn(timeZone: string): string | undefined {
    try {
        return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch {
        return undefined;
    }
}
