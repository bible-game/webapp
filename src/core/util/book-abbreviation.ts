/**
 * Books' short names, for where a full name won't fit (the Guess button's breadcrumbs, when the map is zoomed in): the
 * standard scholarly abbreviations (SBL), which read as words in sentence case, never cut-off names. Keyed by the
 * Bible data's book names
 * @since 8th November 2026
 */
const ABBREVIATIONS: Record<string, string> = {
    "Genesis": "Gen", "Exodus": "Exod", "Leviticus": "Lev", "Numbers": "Num", "Deuteronomy": "Deut",
    "Joshua": "Josh", "Judges": "Judg", "Ruth": "Ruth", "1 Samuel": "1 Sam", "2 Samuel": "2 Sam",
    "1 Kings": "1 Kgs", "2 Kings": "2 Kgs", "1 Chronicles": "1 Chr", "2 Chronicles": "2 Chr", "Ezra": "Ezra",
    "Nehemiah": "Neh", "Esther": "Esth", "Job": "Job", "Psalms": "Ps", "Proverbs": "Prov", "Ecclesiastes": "Eccl",
    "Song of Solomon": "Song", "Song of Songs": "Song", "Isaiah": "Isa", "Jeremiah": "Jer", "Lamentations": "Lam",
    "Ezekiel": "Ezek", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joel", "Amos": "Amos", "Obadiah": "Obad",
    "Jonah": "Jonah", "Micah": "Mic", "Nahum": "Nah", "Habakkuk": "Hab", "Zephaniah": "Zeph", "Haggai": "Hag",
    "Zechariah": "Zech", "Malachi": "Mal",
    "Matthew": "Matt", "Mark": "Mark", "Luke": "Luke", "John": "John", "Acts": "Acts", "Romans": "Rom",
    "1 Corinthians": "1 Cor", "2 Corinthians": "2 Cor", "Galatians": "Gal", "Ephesians": "Eph", "Philippians": "Phil",
    "Colossians": "Col", "1 Thessalonians": "1 Thess", "2 Thessalonians": "2 Thess", "1 Timothy": "1 Tim",
    "2 Timothy": "2 Tim", "Titus": "Titus", "Philemon": "Phlm", "Hebrews": "Heb", "James": "Jas", "1 Peter": "1 Pet",
    "2 Peter": "2 Pet", "1 John": "1 John", "2 John": "2 John", "3 John": "3 John", "Jude": "Jude", "Revelation": "Rev",
};

/** A book's short name ("Psalms" → "Ps"), or its name where it has none */
export const abbreviation = (book: string): string => ABBREVIATIONS[book] ?? book;
