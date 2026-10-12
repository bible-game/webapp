import { playTheme } from "@/core/style/play-theme";

/**
 * Closeness bands for a guess, matching the share-result emoji (🟩 ≤ 500, 🟨 ≤ 2,000, 🟥 beyond).
 * Tiles are tinted rather than filled: `fill` is the tint, `edge` the outline and `text` the label, arrow and distance.
 * @since 2nd October 2026
 */
export type Band = { fill: string, edge: string, text: string };

const tint = (hex: string): Band => ({ fill: `${hex}24`, edge: `${hex}73`, text: hex });

// the status colours, not the map's region hues, so a guess never reads as a place
export const CLOSE: Band = tint(playTheme.success);
export const NEAR: Band = tint(playTheme.warning);
export const FAR: Band = tint(playTheme.error);

/** The found chapter: the success colour, filled solid so a win stands apart from a near miss */
export const FOUND: Band = { fill: playTheme.success, edge: playTheme.success, text: playTheme.bg };

/** The missed answer, shown after the guesses when the game is lost: outlined in white so it stands out most */
export const ANSWER: Band = { fill: `${playTheme.text}1a`, edge: playTheme.text, text: playTheme.text };

export function distanceOf(guess: any): number {
    return parseInt(guess?.distance ?? guess?.closeness?.distance);
}

export function bandOf(guess: any): Band {
    const distance = Math.abs(distanceOf(guess));
    if (distance === 0) return FOUND;
    if (distance <= 500) return CLOSE;
    if (distance <= 2000) return NEAR;
    return FAR;
}

/** One colour for a guess where a whole slot will not fit (the guess counter's dots): one step finer than the tiles, in step with the share text's squares */
export function lightOf(guess: any): string {
    const distance = Math.abs(distanceOf(guess));
    if (distance <= 500) return playTheme.success;
    if (distance <= 2000) return playTheme.warning;
    if (distance <= 5000) return playTheme.orange;
    return playTheme.error;
}
