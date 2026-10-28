import { playTheme } from "@/core/style/play-theme";
import { glow, litGlass, solid } from "@/core/style/regions";

/**
 * Closeness bands for a guess (green ≤ 500, yellow ≤ 2,000, red beyond): the one rule behind the tiles, the guess counter's dots and the share text's squares.
 * Tiles are lit glass rather than filled: `fill` is the tint, `edge` the outline and `text` the label, arrow and distance.
 * Only the found tile is solid, with a soft `glow` outside it.
 * @since 2nd October 2026
 */
export type Band = { fill: string, edge: string, text: string, glow?: string };

const tint = (hex: string): Band => litGlass(hex);

// the status colours, not the map's region hues, so a guess never reads as a place
export const CLOSE: Band = tint(playTheme.success);
export const NEAR: Band = tint(playTheme.warning);
export const FAR: Band = tint(playTheme.error);

/** The found chapter: the green region's solid tone, filled so a win stands apart from a near miss, with a soft glow */
export const FOUND: Band = { fill: solid.green, edge: solid.green, text: playTheme.bg, glow: glow(playTheme.success, 18) };

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

/** One colour for a guess where a whole slot will not fit (the guess counter's dots): the tile's band, as a single status colour */
export function lightOf(guess: any): string {
    const band = bandOf(guess);
    if (band === FOUND || band === CLOSE) return playTheme.success;
    if (band === NEAR) return playTheme.warning;
    return playTheme.error;
}

/** The share text's square for a guess: the tile's band, as an emoji */
export function squareOf(guess: any): string {
    const band = bandOf(guess);
    if (band === FOUND || band === CLOSE) return '🟩';
    if (band === NEAR) return '🟨';
    return '🟥';
}
