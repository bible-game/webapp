/**
 * The worked example used wherever the game is explained (How to play on Play): Psalm 127, the tutorial's own answer,
 * with five guesses closing in on it, one of each colour. Distances are verses from the start of each guessed chapter to
 * the start of Psalm 127 (as score.ts has them); negative means the answer is later in the Bible
 * @since 14th October 2026
 */
export const exampleGuesses = [
    { book: "Mathew", bookKey: "MAT", chapter: 5, level: "none", closeness: { distance: 7171 } },
    { book: "Joshua", bookKey: "JOS", chapter: 1, level: "testament", closeness: { distance: -10320 } },
    { book: "Proverbs", bookKey: "PRO", chapter: 10, level: "division", closeness: { distance: 537 } },
    { book: "Psalms", bookKey: "PSA", chapter: 121, level: "book", closeness: { distance: -40 } },
    { book: "Psalms", bookKey: "PSA", chapter: 127, level: "found", closeness: { distance: 0 } },
];
