import React from "react";
import Navigation from "@/app/navigation";
import ReadAction from "@/app/read/readaction";
import { GameStatesService } from "@/core/service/game-states-service";

async function get(path: string): Promise<any> {
    const response = await fetch(`${process.env.SVC_PASSAGE}/temp/reading/${path}`, {method: "GET"});
    return await response.json();
}

/**
 * Read Passage Page
 * @since 12th April 2025
 */
export default async function Read({params}: { params: Promise<{ passage: string }>}) {

    const { passage } = await params;
    const text = (await get(passage))['text'];
    const verses = (await get(passage))['verses'];
    const wordsPerMinute = 160;
    const readingTime = `${calculateReadingTime()} mins`;

    function calculateReadingTime() {
        if (!!text) {
            const words = text.split(' ');

            return Math.ceil(words.length / wordsPerMinute);

        } else return '';
    }

    function pretty(passage: string): string {
        let i = 0;
        let prettied = "";
        const characters = passage.split("");

        for (const char of characters) {
            if (/^\d+$/.test(char)) prettied += " ";

            if (i == 0) prettied += char.toUpperCase()
            else prettied += char
            i++;
        }

        return prettied;
    }

    function getChapter() {
        const split = pretty(passage).split(" ")
        let chapter = "";

        for (let i = 1; i < split.length; i++) {
            chapter += split[i];
        }

        return chapter;
    }

    return (
        <>
            <div className="bg-white absolute top-0 left-0 w-full">
                <div className="flex justify-center">
                    <Navigation stats={true} play={true} dark={true}/>
                    <main className="h-full w-[40rem] text-black relative top-[6rem] overflow-auto mb-[12rem]">
                        <div className="mb-10">
                            <p className="text-[2.5rem] font-light">{pretty(passage)}</p>
                            <span className="text-gray-400 text-sm font-light">{readingTime}</span>
                        </div>
                        <div>
                            {verses.map((verse: any) => <div className="my-8 flex gap-2 items-start">
                                <div className="text-gray-400 text-[10px] font-light pt-2">{verse.verse}</div>
                                <div className="text-gray-800 text-[18px] font-light leading-[2rem]">{verse.text}</div>
                            </div>)}
                        </div>
                        <ReadAction book={pretty(passage).split(" ")[0]} chapter={getChapter()}/>
                    </main>
                </div>
            </div>
        </>
    );
}