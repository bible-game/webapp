/**
 * Play Theme: the one palette for the play page, shared by Tailwind (`play-*` colours) and the gridmap canvas.
 * Warm neutrals, so the page chrome sits in step with the map.
 * @since 4th October 2026
 */
export const playTheme = {
    bg: "#0e0d0c",        // page and map background
    surface: "#1a1917",   // chips, sheets, modals
    raised: "#262422",    // pressed / hovered surfaces, empty guess slots
    line: "#2e2c29",      // hairlines and outlines
    text: "#f2efe8",      // primary text, primary button fill
    muted: "#b3aea4",     // secondary text
    faint: "#7a766f",     // tertiary text, disabled
    accent: "#e9c46a",    // stars, attention dots
};

export type PlayTheme = typeof playTheme;
