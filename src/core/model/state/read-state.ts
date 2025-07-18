/**
 * Read State Model
 * @since 17th July 2025
 */
export type ReadState = {
    book: string,
    chapter: string,
    verseStart: string
    verseEnd: string,
    passageKey: string
}

export default function getReadKey(state: ReadState) {
    if (!state.verseStart && !state.verseEnd) {
        return `${state.book}${state.chapter}`;

    } else if (!state.verseEnd) {
        return `${state.book}${state.chapter}:${state.verseStart}`;

    } else {
        return `${state.book}${state.chapter}`;
    }
}

