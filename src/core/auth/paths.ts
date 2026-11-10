/** Accept only a local URL and avoid sending the joining flow back into itself. */
export function accountNext(value: unknown): string {
    if (typeof value !== "string" || !value.startsWith("/") || /[\\\u0000-\u0020]/.test(value)) return "/play/today";
    try {
        const url = new URL(value, "https://bible.game");
        const path = decodeURIComponent(url.pathname);
        const accountFlow = /^\/(account|sign-in|sign-up)(\/|$)/.test(path);
        const accountSettings = /^\/account\/manage(\/|$)/.test(path);
        if (url.origin !== "https://bible.game" || (accountFlow && !accountSettings)) return "/play/today";
        return url.pathname + url.search + url.hash;
    } catch {
        return "/play/today";
    }
}

export function continueTo(value: unknown): string {
    return `/account/continue?next=${encodeURIComponent(accountNext(value))}`;
}
