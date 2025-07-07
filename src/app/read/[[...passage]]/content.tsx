"use client"

import React, {useEffect} from "react";
import ScrollProgress from "@/app/read/[[...passage]]/scroll-progress";
import { Input } from "@heroui/input";
import { getPassage } from "@/core/action/get-passage";
import { Spinner } from "@heroui/react";
import Context from "@/app/read/[[...passage]]/context";

export default function Content(props: any) {

    const [key, setKey] = React.useState("");
    const [readingTime, setReadingTime] = React.useState("");
    const wordsPerMinute = 160;
    const [passage, setPassage] = React.useState({} as any);
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (props.passageKey) {
            setKey(props.passageKey);
        } else {
            const key = "1 John 4 : 7 - 19"
            setLoading(true)
            setKey(key);
            getPassage(key).then((response: any) => {
                setPassage(response);
                calculateReadingTime(response);
                setLoading(false);
            });
        }
    }, []);

    function calculateReadingTime(passage: any) {
        if (passage.text) {
            const words = passage.text.split(' ');

            setReadingTime(Math.ceil(words.length / wordsPerMinute).toString() + ' minutes');
        }
    }

    const verses = passage.verses ? passage.verses.map((verse: any) => <div key={verse.verse} className="my-8 flex gap-2 items-start">
        <div className="text-gray-400 text-[10px] font-light pt-2">{verse.verse}</div>
        <div className="text-gray-800 text-[18px] font-light leading-[2rem]">{verse.text}</div>
    </div>) : <></>;





    return (
        <section className="w-[75vw] sm:w-[40rem]">
            <div className="mb-10">
                <Input label="" variant="underlined" value={key}
                       classNames={{
                           input: ["text-[2rem]", "font-light"],
                       }}
                       onValueChange={(key: string) => {
                           setLoading(true);
                           setKey(key);
                           getPassage(key).then((response: any) => {
                               setPassage(response);
                               calculateReadingTime(response);
                               setLoading(false);
                           });
                       }}/>
                <span className="text-gray-400 text-sm font-light">{readingTime}</span>
            </div>
            <ScrollProgress/>
            <div>
                {loading ? <Spinner color="secondary" /> : <div>
                    { passage.verses ? <>
                    <Context passageKey={key} context='before'/>
                    {verses}
                    <Context passageKey={key} context='after'/>
                    </> : <></>}
                </div>}
            </div>
        </section>

    );
}