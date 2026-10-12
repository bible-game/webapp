import { EB_Garamond, Newsreader } from "next/font/google";

/**
 * Optional reader typefaces (Literata is the default, loaded in the root layout as --font-reading)
 * @since 8th October 2026
 */
const newsreader = Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--font-newsreader", display: "swap", preload: false });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap", preload: false });

export const readingFontVariables = `${newsreader.variable} ${garamond.variable}`;

export const READING_FONTS = {
    literata: { label: "Literata", family: "var(--font-reading), Georgia, serif" },
    newsreader: { label: "Newsreader", family: "var(--font-newsreader), Georgia, serif" },
    garamond: { label: "Garamond", family: "var(--font-garamond), Georgia, serif" },
    inter: { label: "Plex Sans", family: "var(--font-sans), system-ui, sans-serif" },
} as const;

export type ReadingFont = keyof typeof READING_FONTS;
