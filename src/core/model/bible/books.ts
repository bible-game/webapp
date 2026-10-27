import colours from "@/app/play/[game]/map/config/colours.json";

/**
 * Books of the Bible, with chapter counts
 * @since 8th October 2026
 */
export type Book = { key: string; name: string; chapters: number; testament: "OT" | "NT" };

export const BOOKS: Book[] = [
    { key: "GEN", name: "Genesis", chapters: 50, testament: "OT" },
    { key: "EXO", name: "Exodus", chapters: 40, testament: "OT" },
    { key: "LEV", name: "Leviticus", chapters: 27, testament: "OT" },
    { key: "NUM", name: "Numbers", chapters: 36, testament: "OT" },
    { key: "DEU", name: "Deuteronomy", chapters: 34, testament: "OT" },
    { key: "JOS", name: "Joshua", chapters: 24, testament: "OT" },
    { key: "JDG", name: "Judges", chapters: 21, testament: "OT" },
    { key: "RUT", name: "Ruth", chapters: 4, testament: "OT" },
    { key: "1SA", name: "1 Samuel", chapters: 31, testament: "OT" },
    { key: "2SA", name: "2 Samuel", chapters: 24, testament: "OT" },
    { key: "1KI", name: "1 Kings", chapters: 22, testament: "OT" },
    { key: "2KI", name: "2 Kings", chapters: 25, testament: "OT" },
    { key: "1CH", name: "1 Chronicles", chapters: 29, testament: "OT" },
    { key: "2CH", name: "2 Chronicles", chapters: 36, testament: "OT" },
    { key: "EZR", name: "Ezra", chapters: 10, testament: "OT" },
    { key: "NEH", name: "Nehemiah", chapters: 13, testament: "OT" },
    { key: "EST", name: "Esther", chapters: 10, testament: "OT" },
    { key: "JOB", name: "Job", chapters: 42, testament: "OT" },
    { key: "PSA", name: "Psalms", chapters: 150, testament: "OT" },
    { key: "PRO", name: "Proverbs", chapters: 31, testament: "OT" },
    { key: "ECC", name: "Ecclesiastes", chapters: 12, testament: "OT" },
    { key: "SNG", name: "Song of Songs", chapters: 8, testament: "OT" },
    { key: "ISA", name: "Isaiah", chapters: 66, testament: "OT" },
    { key: "JER", name: "Jeremiah", chapters: 52, testament: "OT" },
    { key: "LAM", name: "Lamentations", chapters: 5, testament: "OT" },
    { key: "EZK", name: "Ezekiel", chapters: 48, testament: "OT" },
    { key: "DAN", name: "Daniel", chapters: 12, testament: "OT" },
    { key: "HOS", name: "Hosea", chapters: 14, testament: "OT" },
    { key: "JOL", name: "Joel", chapters: 3, testament: "OT" },
    { key: "AMO", name: "Amos", chapters: 9, testament: "OT" },
    { key: "OBA", name: "Obadiah", chapters: 1, testament: "OT" },
    { key: "JON", name: "Jonah", chapters: 4, testament: "OT" },
    { key: "MIC", name: "Micah", chapters: 7, testament: "OT" },
    { key: "NAM", name: "Nahum", chapters: 3, testament: "OT" },
    { key: "HAB", name: "Habakkuk", chapters: 3, testament: "OT" },
    { key: "ZEP", name: "Zephaniah", chapters: 3, testament: "OT" },
    { key: "HAG", name: "Haggai", chapters: 2, testament: "OT" },
    { key: "ZEC", name: "Zechariah", chapters: 14, testament: "OT" },
    { key: "MAL", name: "Malachi", chapters: 4, testament: "OT" },
    { key: "MAT", name: "Matthew", chapters: 28, testament: "NT" },
    { key: "MRK", name: "Mark", chapters: 16, testament: "NT" },
    { key: "LUK", name: "Luke", chapters: 24, testament: "NT" },
    { key: "JHN", name: "John", chapters: 21, testament: "NT" },
    { key: "ACT", name: "Acts", chapters: 28, testament: "NT" },
    { key: "ROM", name: "Romans", chapters: 16, testament: "NT" },
    { key: "1CO", name: "1 Corinthians", chapters: 16, testament: "NT" },
    { key: "2CO", name: "2 Corinthians", chapters: 13, testament: "NT" },
    { key: "GAL", name: "Galatians", chapters: 6, testament: "NT" },
    { key: "EPH", name: "Ephesians", chapters: 6, testament: "NT" },
    { key: "PHP", name: "Philippians", chapters: 4, testament: "NT" },
    { key: "COL", name: "Colossians", chapters: 4, testament: "NT" },
    { key: "1TH", name: "1 Thessalonians", chapters: 5, testament: "NT" },
    { key: "2TH", name: "2 Thessalonians", chapters: 3, testament: "NT" },
    { key: "1TI", name: "1 Timothy", chapters: 6, testament: "NT" },
    { key: "2TI", name: "2 Timothy", chapters: 4, testament: "NT" },
    { key: "TIT", name: "Titus", chapters: 3, testament: "NT" },
    { key: "PHM", name: "Philemon", chapters: 1, testament: "NT" },
    { key: "HEB", name: "Hebrews", chapters: 13, testament: "NT" },
    { key: "JAS", name: "James", chapters: 5, testament: "NT" },
    { key: "1PE", name: "1 Peter", chapters: 5, testament: "NT" },
    { key: "2PE", name: "2 Peter", chapters: 3, testament: "NT" },
    { key: "1JN", name: "1 John", chapters: 5, testament: "NT" },
    { key: "2JN", name: "2 John", chapters: 1, testament: "NT" },
    { key: "3JN", name: "3 John", chapters: 1, testament: "NT" },
    { key: "JUD", name: "Jude", chapters: 1, testament: "NT" },
    { key: "REV", name: "Revelation", chapters: 22, testament: "NT" },
];

const normalise = (name: string) => name.replace(/\s/g, "").toLowerCase();

/** Finds a book by name, ignoring spaces and case (e.g. "1John" → "1 John") */
export function findBook(name?: string): Book | undefined {
    if (!name) return undefined;
    const key = normalise(name);
    return BOOKS.find((b) => normalise(b.name) === key);
}

/** The colour of the book's division, as drawn on Play's map */
export function divisionColour(book?: Book): string | undefined {
    return book ? (colours as Record<string, string>)[book.key] : undefined;
}
