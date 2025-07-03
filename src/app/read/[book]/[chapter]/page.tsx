import React from "react";
import Navigation from "@/app/navigation";
import ReadAction from "@/app/read/readaction";
import Context from "@/app/read/[book]/[chapter]/context";
import ScrollProgress from "@/app/read/[book]/[chapter]/scroll-progress";

async function getReading(path: string): Promise<any> {
    const response = await fetch(`${process.env.SVC_PASSAGE}/temp/reading/${path}`, {method: "GET"});
    return await response.json();
}

async function getPreContext(path: string): Promise<any> {
    const response = await fetch(`${process.env.SVC_PASSAGE}/context/before/${path}`, {method: "GET"});
    return response.json();
}

async function getPostContext(path: string): Promise<any> {
    const response = await fetch(`${process.env.SVC_PASSAGE}/context/after/${path}`, {method: "GET"});
    return response.json();
}

/**
 * Read Passage Page
 * @since 12th April 2025
 */
export default async function Read({params}: { params: Promise<{ book: string, chapter: string }>}) {

    const { book, chapter } = await params;
    const passage = await getReading(book+chapter);
    const preContext = await getPreContext(book+chapter);
    const postContext = await getPostContext(book+chapter);
    const text = passage['text'];
    const verses = passage['verses'];
    const reference = passage['reference'];
    const wordsPerMinute = 160;
    const readingTime = `${calculateReadingTime()} mins`;

    function calculateReadingTime() {
        if (text) {
            const words = text.split(' ');

            return Math.ceil(words.length / wordsPerMinute);

        } else return '';
    }

    return (
            <div className="bg-white absolute top-0 left-0 w-full">
                <div className="flex justify-center">
                    <Navigation stats={true} play={true} dark={true}/>
                    <main className="h-full w-[75vw] sm:w-[40rem] text-black relative top-[6rem] overflow-auto mb-[12rem]">
                        <div className="mb-10">
                            <p className="text-[2.5rem] font-light">{reference}</p>
                            <span className="text-gray-400 text-sm font-light">{readingTime}</span>
                        </div>
                        <ScrollProgress />
                        <Context content={preContext.text} />
                        <div>
                            {verses.map((verse: any) => <div key={verse.verse} className="my-8 flex gap-2 items-start">
                                <div className="text-gray-400 text-[10px] font-light pt-2">{verse.verse}</div>
                                <div className="text-gray-800 text-[18px] font-light leading-[2rem]">{verse.text}</div>
                            </div>)}
                        </div>
                        <Context content={postContext.text} />
                        <ReadAction book={book} chapter={chapter}/>
                    </main>
                </div>
            </div>
    );
}