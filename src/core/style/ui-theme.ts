/**
 * Application palette (see docs/look-and-feel.md, 1.2 "Atmosphere"). Each key becomes a `--ui-<key>` CSS variable and a
 * `ui-<key>` Tailwind colour. A near-black ground (the animated Ground behind every page) under glass surfaces: surfaces
 * are a faint, cool light so the ground shows through. Colour means region (see playTheme and regions.ts).
 */
export const uiTheme = {
    /** The ground's near-black base; also text on light fills (the white primary, solid region buttons, the found tile) */
    bg: "#05060a",
    /** Glass: buttons, chips, fields, cards */
    surface: "rgba(180, 195, 255, 0.06)",
    /** Glass, a step brighter: selected segments, counters, hover */
    raised: "rgba(180, 195, 255, 0.10)",
    /** Outlines and dividers */
    line: "rgba(180, 195, 255, 0.16)",
    /**
     * Sheets, dialogs, popovers and the drawer: a dense indigo-black glass, so text over the map stays readable. No backdrop
     * blur: these fade in, and a blur isn't drawn while an ancestor is fading, so it would pop in at the end.
     */
    sheet: "rgba(11, 13, 26, 0.96)",
    text: "#f2f3f4",
    muted: "#b5b8bd",
    faint: "#93979e",
    /** Stars (the reward); the yellow region's light */
    accent: "#d4b455",
    /** Status: success, warning and error borrow the green, yellow and red regions' light. Closeness is the traffic light of these. */
    success: "#70ce98",
    warning: "#d4b455",
    error: "#ed8c7f",
    /** The streak flame, and the fourth step between warning and error */
    orange: "#eca070",
    /** Utility: help (the blue region's light) */
    help: "#43cae7",
    /** Utility: not logged in, required marks. Shares the warning yellow: one colour for "needs attention" */
    notice: "#d4b455",
    /** Starlight: Far guesses and hover (1), Near and selected (2), Close and correct (3) */
    "light-1": "rgba(242, 243, 244, 0.08)",
    "light-2": "rgba(242, 243, 244, 0.18)",
    "light-3": "rgba(242, 243, 244, 0.34)",
};
