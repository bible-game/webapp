import { uiTheme } from "./ui-theme";

// Play shares the application chrome and adds the region colours (the light tier: see regions.ts for the others).
// The keys are the regions' historic names: teal is the blue region (Law, Paul), rose the red (Wisdom, General letters),
// gold the yellow (Gospels, Minor prophets).
export const playTheme = {
    ...uiTheme,
    teal: "#43cae7",
    purple: "#abaeff",
    rose: "#ed8c7f",
    green: "#70ce98",
    gold: "#d4b455",
};

export type PlayTheme = typeof playTheme;
