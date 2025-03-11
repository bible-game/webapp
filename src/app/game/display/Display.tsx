"use client"

const theLaw = {
    books: [
        { key: "Ge", name: "Genesis" },
        { key: "Ex", name: "Exodus" },
        { key: "Le", name: "Leviticus" },
        { key: "Nu", name: "Numbers" },
        { key: "De", name: "Deuteronomy" }
    ],
    color: "blue",
    division: "The Law"
};

const history = {
    books: [
        { key: "Js", name: "Joshua" },
        { key: "Jd", name: "Judges" },
        { key: "Ru", name: "Ruth" },
        { key: "1Sa", name: "1 Samuel" },
        { key: "2Sa", name: "2 Samuel" },
        { key: "1Ki", name: "1 Kings" },
        { key: "2Ki", name: "2 Kings" },
        { key: "1Ch", name: "1 Chronicles" },
        { key: "2Ch", name: "2 Chronicles" },
        { key: "Ez", name: "Ezra" },
        { key: "Ne", name: "Nehemiah" },
        { key: "Es", name: "Esther" }
    ],
    color: "purple",
    division: "History"
};

const wisdom = {
    books: [
        { key: "Jb", name: "Job" },
        { key: "Ps", name: "Psalms" },
        { key: "Pr", name: "Proverbs" },
        { key: "Ec", name: "Ecclesiastes" },
        { key: "So", name: "Songs of Solomon" }
    ],
    color: "red",
    division: "Wisdom"
};

const majorProp = {
    books: [
        { key: "Is", name: "Isaiah" },
        { key: "Je", name: "Jeremiah" },
        { key: "La", name: "Lamentations" },
        { key: "Ek", name: "Ezekiel" },
        { key: "Da", name: "Daniel" }
    ],
    color: "green",
    division: "Major Prophets"
};

const minorProp = {
    books: [
        { key: "Ho", name: "Hosea" },
        { key: "Jl", name: "Joel" },
        { key: "Am", name: "Amos" },
        { key: "Ob", name: "Obadiah" },
        { key: "Jo", name: "Jonah" },
        { key: "Mi", name: "Micah" },
        { key: "Na", name: "Nahum" },
        { key: "Hk", name: "Habakkuk" },
        { key: "Zp", name: "Zephaniah" },
        { key: "Hg", name: "Haggai" },
        { key: "Zc", name: "Zechariah" },
        { key: "Ma", name: "Malachi" }
    ],
    color: "yellow",
    division: "Minor Prophets"
};

const gospels = {
    books: [
        { key: "Mt", name: "Mathew" },
        { key: "Mk", name: "Mark" },
        { key: "Lu", name: "Luke" },
        { key: "Jn", name: "John" },
    ],
    color: "yellow",
    division: "Gospels"
};

const earlyChurch = {
    books: [
        { key: "Ac", name: "Acts" }
    ],
    color: "green",
    division: "Early Church"
};

const pauLetters = {
    books: [
        { key: "Ro", name: "Romans" },
        { key: "1Co", name: "1 Corinthians" },
        { key: "2Co", name: "2 Corinthians" },
        { key: "Ga", name: "Galatians" },
        { key: "Ep", name: "Ephesians" },
        { key: "Ph", name: "Philippians" },
        { key: "Cl", name: "Colossians" },
        { key: "1Th", name: "1 Thessalonians" },
        { key: "2Th", name: "2 Thessalonians" },
        { key: "1Ti", name: "1 Timothy" },
        { key: "2Ti", name: "2 Timothy" },
        { key: "Tu", name: "Titus" }
    ],
    color: "blue",
    division: "Paul's Letters"
};

const moreLetters = {
    books: [
        { key: "Pm", name: "Philemon" },
        { key: "He", name: "Hebrews" }
    ],
    color: "blue",
    division: "Paul's Letters"
};

const genLetters = {
    books: [
        { key: "Ja", name: "James" },
        { key: "1Pe", name: "1 Peter" },
        { key: "2Pe", name: "2 Peter" },
        { key: "1Jn", name: "1 John" },
        { key: "2Jn", name: "2 John" },
        { key: "3Jn", name: "3 John" },
        { key: "Ju", name: "Ju" }
    ],
    color: "red",
    division: "General Letters"
};

const prophecy = {
    books: [
        { key: "Re", name: "Revelation" }
    ],
    color: "purple",
    division: "Prophecy"
};

const oldTestament = [
    { row: 0, divisions: [theLaw] },
    { row: 1, divisions: [history] },
    { row: 2, divisions: [wisdom, majorProp] },
    { row: 3, divisions: [minorProp] }
];

const newTestament = [
    { row: 0, divisions: [gospels] },
    { row: 1, divisions: [earlyChurch] },
    { row: 2, divisions: [pauLetters] },
    { row: 3, divisions: [moreLetters, genLetters, prophecy] }
];

const Display = () => {

    return  <>
        {oldTestament.map((rows: any) => <div>{rows.divisions.map((div: any) => <span>{div.books.map((book: any) => <span>{book.key}</span>)}</span>)}</div>)}
        {newTestament.map((rows: any) => <div>{rows.divisions.map((div: any) => <span>{div.books.map((book: any) => <span>{book.key}</span>)}</span>)}</div>)}
    </>
}

export default Display;