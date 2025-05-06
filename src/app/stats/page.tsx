"use client"

import { Toaster } from "react-hot-toast";
import React from "react";
import Navigation from "@/app/navigation";
import Background from "@/app/background";
import Cell from "@/app/stats/cell";

/**
 * Statistics Page
 * @since 12th April 2025
 */
export default function Stats() {

    const completion = [
        {
            book: "genesis",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0]
        },
        {
            book: "exodus",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0]
        },
        {
            book: "leviticus",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0]
        },
        {
            book: "numbers",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0, 0]
        },
        {
            book: "deuteronomy",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0]
        },

        {
            book: "joshua",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
        },
        {
            book: "judges",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0]
        },
        {
            book: "ruth",
            chapter: [0,0,0,0]
        },
        {
            book: "1samuel",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0]
        },
        {
            book: "2samuel",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
        },
        {
            book: "1kings",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0]
        },
        {
            book: "2kings",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0]
        },
        {
            book: "1chronicles",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
        },
        {
            book: "2chronicles",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0, 0,0]
        },
        {
            book: "ezra",
            chapter: [0,0,0,0,0, 0,0,0,0,0]
        },
        {
            book: "nehemiah",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0]
        },
        {
            book: "esther",
            chapter: [0,0,0,0,0, 0,0,0,0,0]
        },

        {
            book: "job",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0]
        },
        {
            book: "psalms",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0]
        },
        {
            book: "proverbs",
            chapter: [0,0,0,0,2, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0]
        },
        {
            book: "ecclesiastes",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,]
        },
        {
            book: "songofsolomon",
            chapter: [0,0,0,0,0, 0,0,0]
        },

        {
            book: "isaiah",
            chapter: [0,0,0,0,0, 0,0,1,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0]
        },
        {
            book: "jeremiah",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0]
        },
        {
            book: "lamentations",
            chapter: [0,0,0,0,0]
        },
        {
            book: "ezekiel",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,]
        },
        {
            book: "daniel",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,]
        },

        {
            book: "hosea",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
        },
        {
            book: "joel",
            chapter: [0,0,0,0]
        },
        {
            book: "amos",
            chapter: [0,0,0,0,0, 0,0,0,0,]
        },
        {
            book: "obadiah",
            chapter: [0,]
        },
        {
            book: "jonah",
            chapter: [0,0,0,0]
        },
        {
            book: "micah",
            chapter: [0,0,0,0,0, 0,0]
        },
        {
            book: "nahum",
            chapter: [0,0,0,]
        },
        {
            book: "habakkuk",
            chapter: [0,0,0,]
        },
        {
            book: "zephaniah",
            chapter: [0,0,0,]
        },
        {
            book: "haggai",
            chapter: [0,0,]
        },
        {
            book: "zechariah",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
        },
        {
            book: "malachi",
            chapter: [0,0,0,]
        },

        {
            book: "mathew",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,]
        },
        {
            book: "mark",
            chapter: [0,0,0,0,0, 0,2,0,0,0, 0,0,0,0,0 ,0]
        },
        {
            book: "luke",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0]
        },
        {
            book: "john",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,]
        },

        {
            book: "acts",
            chapter: [0,0,2,1,0, 0,2,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,1,0,0,0,0 ,0,0,0]
        },

        {
            book: "romans",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,]
        },
        {
            book: "1corinthians",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,]
        },
        {
            book: "2corinthians",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,]
        },
        {
            book: "galatians",
            chapter: [0,0,0,0,0, 0,]
        },
        {
            book: "ephesians",
            chapter: [0,0,0,0,0, 0,]
        },
        {
            book: "philippians",
            chapter: [0,0,0,0]
        },
        {
            book: "colossians",
            chapter: [0,0,0,0,]
        },
        {
            book: "1thessalonians",
            chapter: [0,0,0,0,0,]
        },
        {
            book: "2thessalonians",
            chapter: [0,0,0,]
        },
        {
            book: "1timothy",
            chapter: [0,0,0,0,0, 0,]
        },
        {
            book: "2timothy",
            chapter: [0,0,0,0]
        },
        {
            book: "titus",
            chapter: [0,0,0,]
        },
        {
            book: "philemon",
            chapter: [0,]
        },
        {
            book: "hebrews",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,]
        },

        {
            book: "james",
            chapter: [0,0,0,0,0,]
        },
        {
            book: "1peter",
            chapter: [0,0,0,0,0]
        },
        {
            book: "2peter",
            chapter: [0,0,0]
        },
        {
            book: "1john",
            chapter: [0,0,0,0,0,]
        },
        {
            book: "2john",
            chapter: [0,]
        },
        {
            book: "3john",
            chapter: [0,]
        },
        {
            book: "jude",
            chapter: [0,]
        },

        {
            book: "revelation",
            chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,]
        },
    ]

    const calcCompletion = () => {
        let completed = 0;

        for (const book of completion) {
            for (const chapter of book.chapter) {
                if (chapter == 1) completed++
            }
        }

        return (100 * completed / 1_091).toFixed(2);
    }

    const [stars, setStars] = React.useState(52);
    const [games, setGames] = React.useState(70);
    const [streak, setStreak] = React.useState(3);
    const [complete, setComplete] = React.useState(calcCompletion());

    return (
        <>
            <Background/>
            <Navigation play={true} read={true}/>
            <main>
                <Toaster position="bottom-right"/>
                <section>
                    <p className="text-[1.5rem]">Statistics</p>
                    <div className="flex my-8 justify-start gap-12 items-center">
                        <div className="flex items-center">
                            <p className="text-[1.5rem]">{stars}</p>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24"
                                 stroke-width="1.5"
                                 stroke="gold" className="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                            </svg>
                        </div>
                        <div><p className="text-[1.5rem]">{games}<span className="text-gray-400 text-[1rem] ml-1">games</span></p></div>
                        <div><p className="text-[1.5rem]">{streak}<span className="text-gray-400 text-[1rem] ml-1">days</span></p></div>
                        <div><p className="text-[1.5rem]">{complete}<span className="text-gray-400 text-[1rem]">%</span></p></div>
                    </div>
                </section>
                <section className="flex flex-wrap">
                    {completion.map((c: any) => c.chapter.map((chapter: any, index = 0) => <Cell
                        label={c.book + ++index} chapter={chapter}/>))}
                </section>
            </main>
        </>
    );
}