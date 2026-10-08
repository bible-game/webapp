import { EB_Garamond, Literata } from "next/font/google";

/**
 * Optional reader typefaces (Newsreader is the default, loaded in the root layout)
 * @since 8th October 2026
 */
const literata = Literata({ subsets: ["latin"], variable: "--font-literata", display: "swap", preload: false });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap", preload: false });

export const readingFontVariables = `${literata.variable} ${garamond.variable}`;

export const READING_FONTS = {
    newsreader: { label: "Newsreader", family: "var(--font-reading), Georgia, serif" },
    literata: { label: "Literata", family: "var(--font-literata), Georgia, serif" },
    garamond: { label: "Garamond", family: "var(--font-garamond), Georgia, serif" },
    inter: { label: "Inter", family: "Inter, system-ui, sans-serif" },
} as const;

export type ReadingFont = keyof typeof READING_FONTS;
