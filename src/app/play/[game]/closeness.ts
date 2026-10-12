import colours from "@/app/play/[game]/map/config/colours.json";
import { playTheme } from "@/core/style/play-theme";

/**
 * Closeness bands for a guess, shown as how brightly its slot is lit (see docs/look-and-feel.md): Far 8%, Near 18% and
 * Close 34% starlight. Colour is reserved for place, so only the found chapter takes a region colour.
 * `fill` is the slot, `edge` its outline and `text` the label, arrow and distance.
 * @since 2nd October 2026
 */
export type Band = { fill: string, edge: string, text: string };

export const FAR: Band = { fill: playTheme["light-1"], edge: playTheme.line, text: playTheme.faint };
export const NEAR: Band = { fill: playTheme["light-2"], edge: playTheme.line, text: playTheme.muted };
export const CLOSE: Band = { fill: playTheme["light-3"], edge: playTheme.line, text: playTheme.text };

/** The missed answer, shown after the guesses when the game is lost: outlined in white so it stands out most */
export const ANSWER: Band = { fill: playTheme["light-1"], edge: playTheme.text, text: playTheme.text };

/** The found chapter, lit in its own region colour */
export function foundBand(colour: string): Band {
    return { fill: colour, edge: colour, text: playTheme.bg };
}

/** The region colour of a guess's book (the map's own) */
export function regionColour(guess: any): string {
    return (colours as Record<string, string>)[guess?.bookKey] ?? playTheme.text;
}

export function distanceOf(guess: any): number {
    return parseInt(guess?.closeness?.distance);
}

export function bandOf(guess: any): Band {
    const distance = Math.abs(distanceOf(guess));
    if (distance === 0) return foundBand(regionColour(guess));
    if (distance <= 500) return CLOSE;
    if (distance <= 2000) return NEAR;
    return FAR;
}

/** One colour for a guess where a whole slot will not fit (the guess counter's dots): the same brightness ramp, or the region when found */
export function lightOf(guess: any): string {
    const distance = Math.abs(distanceOf(guess));
    if (distance === 0) return regionColour(guess);
    if (distance <= 500) return playTheme.text;
    if (distance <= 2000) return playTheme.muted;
    return playTheme.faint;
}
