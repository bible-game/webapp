import React from "react";
import Navigation from "@/app/navigation";

function get(path: string): Promise<any> {
    return fetch(`${process.env.SVC_PASSAGE}/temp/reading/${path}`, { method: "GET" })
        .then((response) => {
            return response.json()
        });
}

/**
 * Read Passage Page
 * @since 12th April 2025
 */
export default async function Read({params}: { params: Promise<{ passage: string }>}) {

    const { passage } = await params;
    const text = (await get(passage))['text'];
    const verses = (await get(passage))['verses'];
    const wordsPerMinute = 200;
    const readingTime = `${calculateReadingTime()} minute read`;

    function calculateReadingTime() {
        if (!!text) {
            const words = text.split(' ');

            return Math.ceil(words.length / wordsPerMinute);

        } else return '';
    }

    return (
        <>
            <div className="bg-white absolute top-0 left-0 w-full">
                <div className="flex justify-center">
                    <Navigation stats={true} play={true}/>
                    <main className="h-full w-[40rem] text-black relative top-[6rem] overflow-auto mb-[12rem]">
                        <div className="mb-10">
                            <h1 className="text-[2rem]">{passage} <span className="ml-2 text-gray-400 text-sm">{readingTime}</span></h1>
                        </div>
                        <div>
                            {verses.map((verse: any) => <p className="my-4"><span className="text-gray-400 text-xs">{verse.verse} </span> {verse.text}</p>)}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}