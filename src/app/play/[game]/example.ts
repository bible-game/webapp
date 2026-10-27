/**
 * The worked example used wherever the game is explained (How it works on Home, How to play on Play):
 * Revelation 12, found on the fourth guess. Distances are verses from the start of each guessed chapter to the
 * start of Revelation 12; negative means the answer is later in the Bible
 * @since 14th October 2026
 */
export const exampleClue = "A cosmic battle ensues between good and evil";

export const exampleGuesses = [
    { book: "Numbers", chapter: 31, closeness: { distance: -26227 } },
    { book: "Hebrews", chapter: 4, closeness: { distance: -878 } },
    { book: "Revelation", chapter: 16, closeness: { distance: 63 } },
    { book: "Revelation", chapter: 12, closeness: { distance: 0 } },
];
