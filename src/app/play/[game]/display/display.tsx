"use client"

import law from './law.json'
import history from './history.json'
import wisdom from './wisdom.json'
import majorProphets from './major-prophets.json'
import minorProphets from './minor-prophets.json'
import gospels from './gospels.json'
import earlyChurch from './early-church.json'
import paulineLetters from './pauline-letters-1.json'
import moreLetters from './pauline-letters-2.json'
import generalLetters from './general-letters.json'
import prophecy from './prophecy.json'

const colours: any = {
    blue:   {"border": "border border-[#68C3F180]", "colour": "from-[#36ABFF] to-[#80D2FF]"},
    green:  {"border": "border border-[#4CBE7D80]", "colour": "from-[#4DBA7E] to-[#86FEC4]"},
    red:    {"border": "border border-[#BF265CCC]", "colour": "from-[#C54A84] to-[#E35D7D]"},
    purple: {"border": "border border-[#6143BFCC]", "colour": "from-[#8967F6] to-[#A88CFF]"},
    yellow: {"border": "border border-[#A6BF2680]", "colour": "from-[#D0B42B] to-[#E1DD5E]"}
}

const oldTestament = [
    {row: 0, divisions: [law]},
    {row: 1, divisions: [history]},
    {row: 2, divisions: [wisdom, majorProphets]},
    {row: 3, divisions: [minorProphets]}
];

const newTestament = [
    {row: 0, divisions: [gospels, earlyChurch]},
    {row: 1, divisions: [paulineLetters]},
    {row: 2, divisions: [moreLetters, generalLetters, prophecy]}
];

const bookClass = (key: string) => `-translate-x-[4px] -translate-y-[4px] text-[#060842] bg-gradient-to-tr ${colours[key].colour} text-[1rem] h-[40px] w-[40px] flex justify-center items-center ${colours[key].border}`;
const shadowClass = (key: string) => `h-[40px] w-[40px] m-[4px] ${colours[key].border} cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:opacity-100`;

const Display = (props: any) => {

    const isDim = (book: string, div: string, test: string) => {
        if (props.bookFound) {
            return book != props.passage.book;
        }

        if (props.divFound) {
            return div != props.passage.division;
        }

        if (props.testFound) {
            return test != props.passage.testament;
        }
    }

    return <section className="mt-6 flex justify-center">
            <div>
            <div>{oldTestament.map((rows: any) => <div className="flex" key={rows.row}>{rows.divisions.map((div: any) => <div
                key={div.division}
                className="flex">{div.books.map((book: any) =>
                <div key={book.key + book.super} className={isDim(book.name, div.division, 'Old') ? "opacity-40" : "opacity-100"}>
                    <div className={shadowClass(div.colour)} id={book.name} onClick={()=> props.select(book.name, isDim(book.name, div.division, 'Old'))}>
                        <div className={bookClass(div.colour)}>
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
                        <div className={shadowClass(div.colour)} id={book.name} onClick={() => props.select(book.name, isDim(book.name, div.division, 'New'))}>
                            <div className={bookClass(div.colour)}>
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
    </section>
        }

            export default Display;