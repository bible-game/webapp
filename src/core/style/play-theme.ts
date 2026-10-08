import { uiTheme } from "./ui-theme";

// Play shares the application chrome and retains the map's division palette.
export const playTheme = {
    ...uiTheme,
    teal: "#8fc7ce",
    purple: "#ac7db3",
    rose: "#d65f78",
    green: "#78ad88",
    gold: "#d2b96f",
};

export type PlayTheme = typeof playTheme;
