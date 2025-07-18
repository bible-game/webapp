/**
 * Read State Model
 * @since 17th July 2025
 */
export type ReadState = {
    book: string,
    chapter: string,
    verseStart: string
    verseEnd: string
}

export default function getReadKey(state: ReadState) {
    return `${state.book}${state.chapter}:${state.verseStart}-${state.verseEnd}`;
}

