"use client"

import React, { useEffect } from "react";
import ScrollProgress from "@/app/read/[[...passage]]/scroll-progress";
import { Input } from "@heroui/input";
import { getPassage } from "@/core/action/read/get-passage";
import { Spinner } from "@heroui/react";
import Context from "@/app/read/[[...passage]]/context";
import ReadAction from "@/app/read/[[...passage]]/readaction";
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";
import { Button } from "@nextui-org/react";
import { getAudio } from "@/core/action/read/get-audio";
import Link from "next/link";

export default function Content(props: any) {

    const [key, setKey] = React.useState("");
    const [readingTime, setReadingTime] = React.useState("");
    const wordsPerMinute = 160;
    const [passage, setPassage] = React.useState({} as any);
    const [loading, setLoading] = React.useState(false);
    const [audioLoading, setAudioLoading] = React.useState(false);
    const [playing, setPlaying] = React.useState(false);
    const [current, setCurrent] = React.useState("");

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

    function split(passageKey: any): {book: string, chapter: string, verseStart: number | undefined, verseEnd: number | undefined} {
        let key: string;
        if (passageKey instanceof Array) {
            key = passageKey[0]
        } else {
            key = passageKey;
        }
        const bcv = new bcv_parser(lang);
        const osis = bcv.parse(key).osis();

        const hasVerses = osis.includes('-');

        if (hasVerses) {
            const first = osis.split('-')[0];
            const second = osis.split('-')[1];
            const firstParts = first.split('.');
            const secondParts = second.split('.');

            const book = osisToName(firstParts[0]);
            return {
                book: book ? book.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, '$& ') : '',
                chapter: firstParts[1] || 1,
                verseStart: firstParts[2],
                verseEnd: secondParts[2]
            }
        } else {
            const parts = osis.split('.');
            const book = osisToName(parts[0]);
            return {
                book: book ? book.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, '$& ') : '',
                chapter: parts[1] || 1,
                verseStart: undefined,
                verseEnd: undefined
            }
        }
    }

    function playAudio(): void {
        if (key) {
            setAudioLoading(true);
            getAudio(key).then((audioBuffer: any) => {
                if (audioBuffer) {
                    setAudioLoading(false);
                    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" }); // Assuming MP3
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setCurrent(audioUrl);
                    // const audioElement = new Audio(audioUrl);
                    setPlaying(true);
                    // audioElement.play().then(() => setPlaying(false));

                    // Clean up the URL after the audio finishes playing
                    // audioElement.onended = () => {
                    //     URL.revokeObjectURL(audioUrl);
                    // };
                }
            });
        }
    }

    return (
        <section className="w-[75vw] sm:w-[46rem]">
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
                {playing ? <></> : <Button onPress={playAudio}
                                           className="text-blue-600 h-[66px] text-sm rounded-none border-[#ffffff40] m-2"
                                           variant="bordered">
                    {audioLoading ? <Spinner color="primary" /> : 'Listen' }</Button>
                }
                {
                    playing ? <audio controls autoPlay={true}>
                        <source src={current} type="audio/mpeg"/>
                        Your browser does not support the audio element.
                    </audio> : <></>
                }
            </div>
            <ScrollProgress/>
            <div>
                {loading ? <Spinner color="primary"/> : <div>
                    {passage.verses ? <>
                    <Context passageKey={key} context='before'/>
                    {verses}
                    <Context passageKey={key} context='after'/>
                    <div>
                        <ReadAction
                            state={props.state}
                            book={split(key).book}
                            chapter={split(key).chapter}
                            verseStart={split(key).verseStart}
                            verseEnd={split(key).verseEnd}/>
                        <Button as={Link} href={'/study/'+split(key).book.replace(/\s/g, "")+split(key).chapter}
                            className="text-purple-600 h-[66px] text-sm rounded-none border-[#ffffff40] mt-8"
                            variant="bordered">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 strokeWidth={1.25} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                            </svg>
                            Study {split(key).book} {split(key).chapter}
                        </Button>
                    </div>
                    </> : <></>}
                </div>}
            </div>
        </section>

    );
}

const osisToName = (osis: any) => {
    const map: any = {
        Gen: "Genesis",
        Exod: "Exodus",
        Lev: "Leviticus",
        Num: "Numbers",
        Lam: "Lamentations",
        Rev: "Revelation",
        Deut: "Deuteronomy",
        Josh: "Joshua",
        Judg: "Judges",
        Ruth: "Ruth",
        Isa: "Isaiah",
        "1Sam": "1Samuel",
        "2Sam": "2Samuel",
        "1Kgs": "1Kings",
        "2Kgs": "2Kings",
        "2Chr": "2Chronicles",
        "1Chr": "1Chronicles",
        "Ezra": "Ezra",
        Neh: "Nehemiah",
        Esth: "Esther",
        Job: "Job",
        Ps: "Psalms",
        Prov: "Proverbs",
        Eccl: "Ecclesiastes",
        Song: "SongOfSongs",
        Jer: "Jeremiah",
        Ezek: "Ezekiel",
        Dan: "Daniel",
        Hos: "Hosea",
        Joel: "Joel",
        Amos: "Amos",
        Hab: "Hab",
        Obad: "Obadiah",
        Jonah: "Jonah",
        Mic: "Micah",
        Nah: "Nahum",
        Zeph: "Zephaniah",
        Hag: "Haggai",
        Zech: "Zechariah",
        Mal: "Malachi",
        Matt: "Mathew",
        Mark: "Mark",
        Luke: "Luke",
        "1John": "1John",
        "2John": "2John",
        "3John": "3John",
        John: "John",
        Acts: "Acts",
        Rom: "Romans",
        "2Cor": "2Corinthians",
        "1Cor": "1Corinthians",
        Gal: "Galations",
        Eph: "Ephesians",
        Phil: "Philippians",
        Col: "Colossians",
        "2Thess": "2Thessalonians",
        "1Thess": "1Thessalonians",
        "2Tim": "2Timothy",
        "1Tim": "1Timothy",
        Titus: "Titus",
        Phlm: "Philemon",
        Heb: "Hebrews",
        Jas: "James",
        "2Pet": "2Peter",
        "1Pet": "1Peter",
        Jude: "Jude"
    }

    return map[osis];
}