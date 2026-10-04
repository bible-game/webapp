import { playTheme } from "@/core/style/play-theme";

/**
 * Closeness bands for a guess, matching the share-result emoji (🟩 ≤ 500, 🟨 ≤ 2,000, 🟥 beyond).
 * Tiles are tinted rather than filled: `fill` is the tint, `edge` the outline and `text` the label, arrow and distance.
 * @since 2nd October 2026
 */
export type Band = { fill: string, edge: string, text: string };

const tint = (hex: string): Band => ({ fill: `${hex}24`, edge: `${hex}73`, text: hex });

// the map's own hues, so the page keeps to one palette
export const CLOSE: Band = tint(playTheme.green);
export const NEAR: Band = tint(playTheme.gold);
export const FAR: Band = tint(playTheme.rose);

/** The missed answer, shown after the guesses when the game is lost: outlined in white so it stands out most */
export const ANSWER: Band = { fill: `${playTheme.text}1a`, edge: playTheme.text, text: playTheme.text };

export function distanceOf(guess: any): number {
    return parseInt(guess?.closeness?.distance);
}

export function bandOf(guess: any): Band {
    const distance = Math.abs(distanceOf(guess));
    if (distance <= 500) return CLOSE;
    if (distance <= 2000) return NEAR;
    return FAR;
}
