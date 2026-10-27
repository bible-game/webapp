/**
 * Ruled Out: the chapters the guesses so far exclude, each with the reason, keyed by gridmap cell id ("BOOK/chapter").
 * Only a guess that lands in the answer's testament, division or book rules anything out: everything outside the
 * narrowest of those found so far. A guess that misses the answer's testament rules nothing out, and neither does
 * a guess's direction or distance. A chapter already guessed can't be guessed again.
 * @since 5th October 2026
 */
export type RuledOut = Map<string, string>;

type Place = { testament: string, division: string, book: string };
type Chapter = Place & { id: string, ref: string };

/** Every chapter in canonical order, with where it sits in the hierarchy */
function chaptersOf(testaments: any[]): Chapter[] {
    return testaments.flatMap((testament) => testament.divisions.flatMap((division: any) =>
        division.books.flatMap((book: any) => Array.from({ length: book.chapters }, (_, index) => ({
            id: `${book.key}/${index + 1}`,
            ref: `${book.name} ${index + 1}`,
            testament: testament.name,
            division: division.name,
            book: book.name,
        })))));
}

// "Gospels" → "the Gospels division", "The Law" → "the Law division", "Paul's Letters" as it is
const divisionName = (name: string) => name.includes("'") ? name : `the ${name.replace(/^the /i, "")} division`;

const LEVELS = [
    { found: (a: Place, b: Place) => a.testament === b.testament, where: (a: Place) => `the ${a.testament} Testament` },
    { found: (a: Place, b: Place) => a.division === b.division, where: (a: Place) => divisionName(a.division) },
    { found: (a: Place, b: Place) => a.book === b.book, where: (a: Place) => a.book },
];

export function ruledOut(testaments: any[], guesses: any[], answerBook?: string): RuledOut {
    const out: RuledOut = new Map();
    if (!guesses.length || !answerBook) return out;

    const chapters = chaptersOf(testaments);
    const byRef = new Map(chapters.map((chapter) => [chapter.ref, chapter]));
    const answer = chapters.find((chapter) => chapter.book === answerBook);
    if (!answer) return out;

    // the deepest level of the hierarchy any guess shares with the answer (-1: none)
    let depth = -1;
    const guessed: Chapter[] = [];
    for (const guess of guesses) {
        const chapter = byRef.get(`${guess.book} ${guess.chapter}`);
        if (!chapter) continue;
        guessed.push(chapter);

        let shared = -1;
        while (shared + 1 < LEVELS.length && LEVELS[shared + 1].found(chapter, answer)) shared++;
        depth = Math.max(depth, shared);
    }

    if (depth >= 0) {
        const level = LEVELS[depth];
        const reason = `The answer is in ${level.where(answer)}`;
        for (const chapter of chapters) if (!level.found(chapter, answer)) out.set(chapter.id, reason);
    }
    for (const chapter of guessed) out.set(chapter.id, "Already guessed");

    return out;
}
