/**
 * Sync Cookie: marks a log-in whose browser state is still to be merged into the account
 * @since 28th October 2026
 */

/** Set on log-in and cleared once the sync is done, so the browser syncs after the redirect rather than during it */
export const SYNC_PENDING_COOKIE = 'sync_pending';
export const SYNC_PENDING_MAX_AGE = 60 * 60 * 24;

/** Determines if this browser has state waiting to be synced to a newly logged-in account */
export function isSyncPending(): boolean {
    return document.cookie.split('; ').some((cookie) => cookie.startsWith(`${SYNC_PENDING_COOKIE}=`));
}
