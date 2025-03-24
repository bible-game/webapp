"use client"

const theLaw = {
    books: [
        {key: "Ge", name: "Genesis"},
        {key: "Ex", name: "Exodus"},
        {key: "Le", name: "Leviticus"},
        {key: "Nu", name: "Numbers"},
        {key: "De", name: "Deuteronomy"}
    ],
    border: "border border-[#68C3F180]",
    colour: "from-[#36ABFF] to-[#80D2FF]",
    division: "The Law"
};

const history = {
    books: [
        {key: "Js", name: "Joshua"},
        {key: "Jd", name: "Judges"},
        {key: "Ru", name: "Ruth"},
        {key: "Sa", name: "1 Samuel", super: "1"},
        {key: "Sa", name: "2 Samuel", super: "2"},
        {key: "Ki", name: "1 Kings", super: "1"},
        {key: "Ki", name: "2 Kings", super: "2"},
        {key: "Ch", name: "1 Chronicles", super: "1"},
        {key: "Ch", name: "2 Chronicles", super: "2"},
        {key: "Ez", name: "Ezra"},
        {key: "Ne", name: "Nehemiah"},
        {key: "Es", name: "Esther"}
    ],
    border: "border border-[#6143BFCC]",
    colour: "from-[#8967F6] to-[#A88CFF]",
    division: "History"
};

const wisdom = {
    books: [
        {key: "Jb", name: "Job"},
        {key: "Ps", name: "Psalms"},
        {key: "Pr", name: "Proverbs"},
        {key: "Ec", name: "Ecclesiastes"},
        {key: "So", name: "Song of Solomon"}
    ],
    border: "border border-[#BF265CCC]",
    colour: "from-[#C54A84] to-[#E35D7D]",
    division: "Wisdom"
};

const majorProp = {
    books: [
        {key: "Is", name: "Isaiah"},
        {key: "Je", name: "Jeremiah"},
        {key: "La", name: "Lamentations"},
        {key: "Ek", name: "Ezekiel"},
        {key: "Da", name: "Daniel"}
    ],
    border: "border border-[#4CBE7D80]",
    colour: "from-[#4DBA7E] to-[#86FEC4]",
    division: "Major Prophets"
};

const minorProp = {
    books: [
        {key: "Ho", name: "Hosea"},
        {key: "Jl", name: "Joel"},
        {key: "Am", name: "Amos"},
        {key: "Ob", name: "Obadiah"},
        {key: "Jo", name: "Jonah"},
        {key: "Mi", name: "Micah"},
        {key: "Na", name: "Nahum"},
        {key: "Hk", name: "Habakkuk"},
        {key: "Zp", name: "Zephaniah"},
        {key: "Hg", name: "Haggai"},
        {key: "Zc", name: "Zechariah"},
        {key: "Ma", name: "Malachi"}
    ],
    border: "border border-[#A6BF2680]",
    colour: "from-[#D0B42B] to-[#E1DD5E]",
    division: "Minor Prophets"
};

const gospels = {
    books: [
        {key: "Mt", name: "Mathew"},
        {key: "Mk", name: "Mark"},
        {key: "Lu", name: "Luke"},
        {key: "Jn", name: "John"},
    ],
    border: "border border-[#A6BF2680]",
    colour: "from-[#D0B42B] to-[#E1DD5E]",
    division: "Gospels"
};

const earlyChurch = {
    books: [
        {key: "Ac", name: "Acts"}
    ],
    border: "border border-[#4CBE7D80]",
    colour: "from-[#4DBA7E] to-[#86FEC4]",
    division: "Early Church"
};

const pauLetters = {
    books: [
        {key: "Ro", name: "Romans"},
        {key: "Co", name: "1 Corinthians", super: "1"},
        {key: "Co", name: "2 Corinthians", super: "2"},
        {key: "Ga", name: "Galatians"},
        {key: "Ep", name: "Ephesians"},
        {key: "Ph", name: "Philippians"},
        {key: "Cl", name: "Colossians"},
        {key: "Th", name: "1 Thessalonians", super: "1"},
        {key: "Th", name: "2 Thessalonians", super: "2"},
        {key: "Ti", name: "1 Timothy", super: "1"},
        {key: "Ti", name: "2 Timothy", super: "2"},
        {key: "Tu", name: "Titus"}
    ],
    border: "border border-[#68C3F180]",
    colour: "from-[#36ABFF] to-[#80D2FF]",
    division: "Paul's Letters"
};

const moreLetters = {
    books: [
        {key: "Pm", name: "Philemon"},
        {key: "He", name: "Hebrews"}
    ],
    border: "border border-[#68C3F180]",
    colour: "from-[#36ABFF] to-[#80D2FF]",
    division: "Paul's Letters"
};

const genLetters = {
    books: [
        {key: "Ja", name: "James"},
        {key: "Pe", name: "1 Peter", super: "1"},
        {key: "Pe", name: "2 Peter", super: "2"},
        {key: "Jn", name: "1 John", super: "1"},
        {key: "Jn", name: "2 John", super: "2"},
        {key: "Jn", name: "3 John", super: "3"},
        {key: "Ju", name: "Jude"}
    ],
    border: "border border-[#BF265CCC]",
    colour: "from-[#C54A84] to-[#E35D7D]",
    division: "General Letters"
};

const prophecy = {
    books: [
        {key: "Re", name: "Revelation"}
    ],
    border: "border border-[#6143BFCC]",
    colour: "from-[#8967F6] to-[#A88CFF]",
    division: "Prophecy"
};

const oldTestament = [
    {row: 0, divisions: [theLaw]},
    {row: 1, divisions: [history]},
    {row: 2, divisions: [wisdom, majorProp]},
    {row: 3, divisions: [minorProp]}
];

const newTestament = [
    {row: 0, divisions: [gospels, earlyChurch]},
    {row: 1, divisions: [pauLetters]},
    {row: 2, divisions: [moreLetters, genLetters, prophecy]}
];

const bookClass = (border: string, colour: string) => `-translate-x-[4px] -translate-y-[4px] text-[#060842] bg-gradient-to-tr ${colour} text-[1rem] h-[40px] w-[40px] flex justify-center items-center ${border}`;
const shadowClass = (border: string) => `h-[40px] w-[40px] m-[4px] ${border} cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:opacity-100`;

const Display = (props: any) => {

    const isDim = (book: string, div: string, test: string) => {
       // console.log(props.potential);
       // console.log(book);
       //  return !props.potential.includes(book);

        if (props.bookFound) {
            return book != props.passage.book;
        }

        if (props.divFound) {
            return div != props.passage.division;
        }

        if (props.testFound) {
            return test != props.passage.testament;
        }

        // question?? quick and dirty way to do this... come and clean up afterwards...
        // need to know testF, divF, bkF
        // need to collect testament and divisions
    }

    return <div>
        <div>{oldTestament.map((rows: any) => <div className="flex" key={rows.row}>{rows.divisions.map((div: any) => <div
            key={div.division}
            className="flex">{div.books.map((book: any) =>
            <div key={book.key + book.super} className={isDim(book.name, div.division, 'Old') ? "opacity-40" : "opacity-100"}>
                <div className={shadowClass(div.border)} id={book.name} onClick={()=> props.select(book.name, isDim(book.name, div.division, 'Old'))}>
                    <div className={bookClass(div.border, div.colour)}>
                        <p className="-translate-x-0.5 -translate-y-0.5 font-medium">{book.key}</p>
                        <span className="-translate-x-[1px] -translate-y-[.375rem] text-[9px] font-semibold">{book.super}</span>
                    </div>
                </div>
            </div>)}
        </div>)}
        </div>)}
        </div>
        <div className="my-2">{newTestament.map((rows: any) => <div className="flex" key={rows.row}>{rows.divisions.map((div: any) =>
            <div
                key={div.division}
                className="flex">{div.books.map((book: any) =>
                <div key={book.key + book.super} className={isDim(book.name, div.division, 'New') ? "opacity-40" : "opacity-100"}>
                    <div className={shadowClass(div.border)} id={book.name} onClick={() => props.select(book.name, isDim(book.name, div.division, 'New'))}>
                        <div className={bookClass(div.border, div.colour)}>
                        <p className="-translate-x-0.5 -translate-y-0.5 font-medium">{book.key}</p>
                            <span
                                className="-translate-x-[1px] -translate-y-[.375rem] text-[9px] font-semibold">{book.super}</span>
                        </div>
                    </div>
                </div>)}
                </div>)}
            </div>)}
        </div>
            </div>
        }

            export default Display;