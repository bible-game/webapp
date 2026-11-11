import { playTheme } from "@/core/style/play-theme";
import { glow, litGlass, solid } from "@/core/style/regions";

/**
 * Closeness bands for a guess, by how much of the answer's place in the Bible it shares: green for the right book, yellow
 * the right division, amber the right testament, red otherwise. The one rule behind the tiles, the guess counter's dots and
 * the share text's squares; how far away a guess is, and which way, the tile says beside it (guess.tsx).
 * Tiles are lit glass rather than filled: `fill` is the tint, `edge` the outline and `text` the label, arrow and distance.
 * Only the found tile is solid, with a soft `glow` outside it.
 * @since 2nd October 2026
 */
export type Band = { fill: string, edge: string, text: string, glow?: string };

/** What a guess shares with the answer, narrowest first: the chapter itself, its book, division or testament, or nothing */
export type Level = "found" | "book" | "division" | "testament" | "none";

/** Levels from nothing shared to found, so a later index is a deeper one */
export const DEPTH: Level[] = ["none", "testament", "division", "book", "found"];

const tint = (hex: string): Band => litGlass(hex);

// the status colours, not the map's region hues, so a guess never reads as a place
export const BOOK: Band = tint(playTheme.success);
export const DIVISION: Band = tint(playTheme.warning);
export const TESTAMENT: Band = tint(playTheme.orange);
export const MISS: Band = tint(playTheme.error);

/** The found chapter: the green region's solid tone, filled so a win stands apart from the right book, with a soft glow */
export const FOUND: Band = { fill: solid.green, edge: solid.green, text: playTheme.bg, glow: glow(playTheme.success, 18) };

/** The missed answer, shown after the guesses when the game is lost: outlined in white so it stands out most */
export const ANSWER: Band = { fill: `${playTheme.text}1a`, edge: playTheme.text, text: playTheme.text };

const BANDS: Record<Level, Band> = { found: FOUND, book: BOOK, division: DIVISION, testament: TESTAMENT, none: MISS };
const LIGHTS: Record<Level, string> = { found: playTheme.success, book: playTheme.success, division: playTheme.warning, testament: playTheme.orange, none: playTheme.error };
const SQUARES: Record<Level, string> = { found: "🟩", book: "🟩", division: "🟨", testament: "🟧", none: "🟥" };

export function distanceOf(guess: any): number {
    return parseInt(guess?.distance ?? guess?.closeness?.distance);
}

/** Where a book sits: its testament and division, as the Bible's structure has them */
function placeOf(bible: any, book: string): { testament: string, division: string } | undefined {
    for (const testament of bible.testaments)
        for (const division of testament.divisions)
            if (division.books.some((b: any) => b.name === book)) return { testament: testament.name, division: division.name };
}

/** What a guess shares with the answer's place in the Bible */
export function levelOf(bible: any, answerBook: string, guess: any): Level {
    if (distanceOf(guess) === 0) return "found";
    if (guess.book === answerBook) return "book";
    const g = placeOf(bible, guess.book), a = placeOf(bible, answerBook);
    if (!g || !a || g.testament !== a.testament) return "none";
    return g.division === a.division ? "division" : "testament";
}

/**
 * The guesses, each with its level against the answer, for everything that colours them. Worked out as they're shown
 * rather than saved, so guesses saved before levels existed (and the user service's, which never carry one) colour too
 */
export function withLevels(bible: any, guesses: any[], answerBook?: string): any[] {
    if (!answerBook) return guesses;
    return guesses.map((guess) => ({ ...guess, level: levelOf(bible, answerBook, guess) }));
}

/** A guess's level: as worked out by withLevels, else only whether it was found */
const level = (guess: any): Level => guess?.level ?? (distanceOf(guess) === 0 ? "found" : "none");

/** The deepest level any of the guesses reached */
export function deepestOf(guesses: any[]): Level {
    return guesses.reduce((deepest: Level, guess) => DEPTH.indexOf(level(guess)) > DEPTH.indexOf(deepest) ? level(guess) : deepest, "none");
}

export function bandOf(guess: any): Band {
    return BANDS[level(guess)];
}

/** One colour for a guess where a whole tile will not fit (the guess counter's dots): the tile's band, as a single status colour */
export function lightOf(guess: any): string {
    return LIGHTS[level(guess)];
}

/** The share text's square for a guess: the tile's band, as an emoji */
export function squareOf(guess: any): string {
    return SQUARES[level(guess)];
}
