/**
 * Scores a guess in the browser, the only place guesses are scored (the passage service's GuessService, which this
 * matched, is retired), so the tile fills the moment it's guessed. The page already holds the answer and the Bible's
 * structure (core/config/bible.json: every chapter's verse count), so nothing more is revealed.
 * @since 27th October 2026
 */

export type Score = { distance: number, percentage: number };

const TOTAL_VERSES = 31_102;

/** Every chapter in bible order, keyed "<book name><chapter>", with its verse count */
const chaptersOf = (bible: any): { key: string, verses: number }[] =>
    bible.testaments.flatMap((t: any) => t.divisions).flatMap((d: any) => d.books).flatMap((book: any) =>
        Array.from({ length: book.chapters }, (_, i) => ({ key: `${book.name}${i + 1}`, verses: book.verses[i] })));

/**
 * The verses between a guess and the answer (negative when the guess comes before it) and how close that is, as a
 * percentage of the bible; none if either chapter isn't in the structure (Play then says the guess can't be scored)
 */
export function score(bible: any, answer: { book: string, chapter: string }, guess: { book: string, chapter: string }): Score | undefined {
    if (answer.book == guess.book && answer.chapter == guess.chapter) return { distance: 0, percentage: 100 };

    const chapters = chaptersOf(bible);
    const answerIndex = chapters.findIndex(c => c.key == `${answer.book}${answer.chapter}`);
    const guessIndex = chapters.findIndex(c => c.key == `${guess.book}${guess.chapter}`);
    if (answerIndex < 0 || guessIndex < 0) return undefined;

    // the chapters from the earlier one up to (not including) the later one
    const distance = chapters.slice(Math.min(guessIndex, answerIndex), Math.max(guessIndex, answerIndex))
        .reduce((sum, c) => sum + c.verses, 0);
    const sign = guessIndex < answerIndex ? -1 : 1;

    return { distance: sign * distance, percentage: Math.floor(100 * (TOTAL_VERSES - distance) / TOTAL_VERSES) };
}
