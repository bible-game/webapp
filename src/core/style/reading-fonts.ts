import { EB_Garamond, Newsreader } from "next/font/google";

/**
 * Optional reader typefaces (Plex Sans is the default, loaded in the root layout as --font-sans)
 * @since 8th October 2026
 */
const newsreader = Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--font-newsreader", display: "swap", preload: false });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap", preload: false });

export const readingFontVariables = `${newsreader.variable} ${garamond.variable}`;

/**
 * Each face's vertical metrics, in ems, as the browser lays out lines with them (measured from the loaded fonts):
 * cap height, and the ascent and descent that place the baseline. The drop cap is sized and placed from these.
 */
export const READING_FONTS = {
    sans: { label: "Plex Sans", family: "var(--font-sans), system-ui, sans-serif", cap: 0.698, ascent: 1.025, descent: 0.275 },
    newsreader: { label: "Newsreader", family: "var(--font-newsreader), Georgia, serif", cap: 0.715, ascent: 0.735, descent: 0.265 },
    garamond: { label: "Garamond", family: "var(--font-garamond), Georgia, serif", cap: 0.654, ascent: 1.007, descent: 0.298 },
} as const;

export type ReadingFont = keyof typeof READING_FONTS;
