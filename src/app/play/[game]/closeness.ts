/**
 * Closeness bands for a guess, matching the share-result emoji (🟩 ≤ 500, 🟨 ≤ 2,000, 🟥 beyond).
 * `fill` is the tile background, `text` its label, arrow and distance.
 * @since 2nd October 2026
 */
export type Band = { fill: string, text: string };

const CLOSE: Band = { fill: "#80be9c", text: "#1f4e27" };
const NEAR: Band = { fill: "#f7e092", text: "#683405" };
const FAR: Band = { fill: "#cfa4b7", text: "#680527" };

/** The missed answer, shown after the guesses when the game is lost */
export const ANSWER: Band = { fill: "#363636", text: "#ffffff" };

export function distanceOf(guess: any): number {
    return parseInt(guess?.closeness?.distance);
}

export function bandOf(guess: any): Band {
    const distance = Math.abs(distanceOf(guess));
    if (distance <= 500) return CLOSE;
    if (distance <= 2000) return NEAR;
    return FAR;
}
