/**
 * Application palette (see docs/look-and-feel.md). Each key becomes a `--ui-<key>` CSS variable and a `ui-<key>` Tailwind colour.
 * Colour means region (see playTheme), light means "known": the `light-*` steps are starlight at 8, 18 and 34%.
 */
export const uiTheme = {
    bg: "#101112",
    surface: "#1b1c1e",
    raised: "#27292c",
    line: "#35373b",
    text: "#f2f3f4",
    muted: "#b5b8bd",
    faint: "#93979e",
    /** Stars (the reward) only; it overlaps the gold region by design */
    accent: "#d2b96f",
    /** Status: success, warning and error (currently the map's green, gold and rose). Closeness is the traffic light of these. */
    success: "#78ad88",
    warning: "#d2b96f",
    error: "#d65f78",
    /** The streak flame, and the fourth step between warning and error */
    orange: "#e8955a",
    /** Utility: help */
    help: "#4cc9ff",
    /** Utility: not logged in, required marks. Shares the warning gold: one colour for "needs attention" */
    notice: "#d2b96f",
    /** Starlight: Far guesses and hover (1), Near and selected (2), Close and correct (3) */
    "light-1": "rgba(242, 243, 244, 0.08)",
    "light-2": "rgba(242, 243, 244, 0.18)",
    "light-3": "rgba(242, 243, 244, 0.34)",
};
