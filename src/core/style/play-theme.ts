/**
 * Play Theme: the one palette for the play page, shared by Tailwind (`play-*` colours) and the gridmap canvas.
 * Neutral chrome lets the map's division colours carry the identity.
 * @since 4th October 2026
 */
export const playTheme = {
    bg: "#101112",        // page and map background
    surface: "#1b1c1e",   // chips, sheets, modals
    raised: "#27292c",    // pressed / hovered surfaces, empty guess slots
    line: "#35373b",      // hairlines and outlines
    text: "#f2f3f4",      // primary text, primary button fill
    muted: "#b5b8bd",     // secondary text
    faint: "#93979e",     // tertiary text, disabled
    accent: "#d2b96f",    // stars, attention dots (the map's gold)

    // day status in the calendar: started / won / lost
    amber: "#e3a23b",
    won: "#78ad88",
    lost: "#ed8581",
    orange: "#e8955a",

    // division colours, as the map draws them (map/config/colours.json); reused for guess closeness
    teal: "#8fc7ce",
    purple: "#ac7db3",
    rose: "#d65f78",
    green: "#78ad88",
    gold: "#d2b96f",
};

export type PlayTheme = typeof playTheme;
