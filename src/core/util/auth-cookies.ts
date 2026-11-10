/** Marks a device that has logged in before, so we can invite a login and preserve ambiguous legacy progress. */
export const KNOWN_USER_COOKIE = 'known_user';
export const KNOWN_USER_MAX_AGE = 60 * 60 * 24 * 365;
