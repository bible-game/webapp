import { playTheme } from "@/core/style/play-theme";
import { glow, litGlass, solid } from "@/core/style/regions";

/**
 * Closeness bands for a guess, by how many verses it is from the answer, at roughly the sizes of the Bible's own parts:
 * green within 500 (about a book: the mean is 476), yellow within 3,000 (about a division: the mean is 3,142), amber
 * within 8,000 (about the New Testament: 7,956), red beyond. The one rule behind the tiles, the guess counter's dots and
 * the share text's squares. Where the answer can be (its testament, division, book) the map shows by what it greys out.
 * Tiles are lit glass rather than filled: `fill` is the tint, `edge` the outline and `text` the label, arrow and distance.
 * Only the found tile is solid, with a soft `glow` outside it.
 * @since 2nd October 2026
 */
export type Band = { fill: string, edge: string, text: string, glow?: string };

type Level = "found" | "close" | "near" | "far" | "distant";

/** The most verses away a guess can be for each band, closest first */
export const WITHIN = { close: 500, near: 3_000, far: 8_000 };

const tint = (hex: string): Band => litGlass(hex);

// the status colours, not the map's region hues, so a guess never reads as a place
export const CLOSE: Band = tint(playTheme.success);
export const NEAR: Band = tint(playTheme.warning);
export const FAR: Band = tint(playTheme.orange);
export const DISTANT: Band = tint(playTheme.error);

/** The found chapter: the green region's solid tone, filled so a win stands apart from a near miss, with a soft glow */
export const FOUND: Band = { fill: solid.green, edge: solid.green, text: playTheme.bg, glow: glow(playTheme.success, 18) };

/** The missed answer, shown after the guesses when the game is lost: outlined in white so it stands out most */
export const ANSWER: Band = { fill: `${playTheme.text}1a`, edge: playTheme.text, text: playTheme.text };

const BANDS: Record<Level, Band> = { found: FOUND, close: CLOSE, near: NEAR, far: FAR, distant: DISTANT };
const LIGHTS: Record<Level, string> = { found: playTheme.success, close: playTheme.success, near: playTheme.warning, far: playTheme.orange, distant: playTheme.error };
const SQUARES: Record<Level, string> = { found: "🟩", close: "🟩", near: "🟨", far: "🟧", distant: "🟥" };

export function distanceOf(guess: any): number {
    return parseInt(guess?.distance ?? guess?.closeness?.distance);
}

function levelOf(guess: any): Level {
    const distance = Math.abs(distanceOf(guess));
    if (distance === 0) return "found";
    if (distance <= WITHIN.close) return "close";
    if (distance <= WITHIN.near) return "near";
    if (distance <= WITHIN.far) return "far";
    return "distant";
}

export function bandOf(guess: any): Band {
    return BANDS[levelOf(guess)];
}

/** One colour for a guess where a whole tile will not fit (the guess counter's dots): the tile's band, as a single status colour */
export function lightOf(guess: any): string {
    return LIGHTS[levelOf(guess)];
}

/** The share text's square for a guess: the tile's band, as an emoji */
export function squareOf(guess: any): string {
    return SQUARES[levelOf(guess)];
}
