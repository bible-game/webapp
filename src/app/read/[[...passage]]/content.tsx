"use client"

import React, { useEffect, useMemo, useState } from "react";
import ScrollProgress from "@/app/read/[[...passage]]/scroll-progress";
import { Input } from "@heroui/input";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { getPassage } from "@/core/action/read/get-passage";
import { Spinner } from "@heroui/react";
import Context from "@/app/read/[[...passage]]/context";
import ReadAction from "@/app/read/[[...passage]]/readaction";
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";
import { Button } from "@nextui-org/react";
import { getAudio } from "@/core/action/read/get-audio";
import Link from "next/link";
import { ChevronDown, BookOpenText, SearchIcon, XIcon, HeadphonesIcon, GraduationCapIcon } from "lucide-react";
import { AudioPlayer } from "@/app/read/[[...passage]]/audio-player";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from '@mantine/hooks';
import translations from "./translations.json";


const usePassage = (passageKey: string, translation?: string) => {
    return useQuery({
        queryKey: ['passage', passageKey, translation],
        queryFn: () => getPassage(passageKey, translation),
        staleTime: Infinity,
    });
}

export default function Content(props: any) {
    const [key, setKey] = useState(props.passageKey ? prettyPassage(Array.isArray(props.passageKey) ? props.passageKey[0] : props.passageKey) : "1 John 4 : 7 - 19");
    const wordsPerMinute = 160;
    const [audioLoading, setAudioLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState("");
    const [selectedTranslations, setSelectedTranslations] = useState(new Set(["web"]));
    const [translation, setTranslation] = useState<string>(translations["web"].abbr);

    function prettyPassage(passage: string): string {
        return passage.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, "$& ");
    } []
    const [debouncedKey] = useDebouncedValue(key, 400);


    const { data: passage, isLoading: loading, isError, refetch } = usePassage(debouncedKey, translation);

    const readingTime = useMemo(() => {
        if (passage?.text) {
            const words = passage?.text.split(" ");
            return Math.ceil(words.length / wordsPerMinute).toString() + " minutes";
        }
    }, [passage]);

    const selectedValue = useMemo(() => {
        const selectedTranslation = Array.from(selectedTranslations)[0];
        return translations[selectedTranslation as keyof typeof translations] || selectedTranslation;
    }, [selectedTranslations]);


    const verses = passage?.verses ? (
        passage.verses.map((verse: any) => (
            <div key={verse.verse} className="my-6 grid grid-cols-[auto,1fr] gap-3 items-start">
                <div className="text-gray-400 text-[10px] font-light pt-2">{verse.verse}</div>
                <div className="text-gray-800 text-[16px] font-light leading-[1.75rem]">{verse.text}</div>
            </div>
        ))
    ) : null;

    function split(passageKey: any): {
        book: string;
        chapter: string;
        verseStart: number | undefined;
        verseEnd: number | undefined
    } {
        let k: string;
        if (passageKey instanceof Array) {
            k = passageKey[0];
        } else {
            k = passageKey;
        }
        const bcv = new bcv_parser(lang);
        const osis = bcv.parse(k).osis();

        const hasVerses = osis.includes("-");

        if (hasVerses) {
            const first = osis.split("-")[0];
            const second = osis.split("-")[1];
            const firstParts = first.split(".");
            const secondParts = second.split(".");

            const book = osisToName(firstParts[0]);
            return {
                book: book ? book.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, "$& ") : "",
                chapter: (firstParts[1] as any) || 1,
                verseStart: firstParts[2] as any,
                verseEnd: secondParts[2] as any,
            };
        } else {
            const parts = osis.split(".");
            const book = osisToName(parts[0]);
            return {
                book: book ? book.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, "$& ") : "",
                chapter: (parts[1] as any) || 1,
                verseStart: undefined,
                verseEnd: undefined,
            };
        }
    }

    function playAudio(): void {
        if (key) {
            setAudioLoading(true);
            getAudio(key).then((audioBuffer: any) => {
                if (audioBuffer) {
                    setAudioLoading(false);
                    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setCurrent(audioUrl);
                    setPlaying(true);
                }
            });
        }
    }

    const handleSearchChange = (key: string) => {
        setKey(key);
    }

    const splitKey = useMemo(() => (key ? split(key) : { book: "", chapter: "", verseStart: undefined, verseEnd: undefined }), [key]);

    return (
        <section className="relative mt-4 sm:mt-6 w-[90%] left-[5%]">
            <ScrollProgress
                className="bg-gradient-to-r from-indigo-600 to-violet-600"
                height={6}
            />

            {/* Toolbar */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Input
                            aria-label="Passage"
                            variant="underlined"
                            radius="lg"
                            size="lg"
                            value={key}
                            startContent={<SearchIcon className="size-5 text-slate-400" />}
                            endContent={
                                key ? (
                                    <button
                                        aria-label="Clear"
                                        className="p-1 rounded hover:bg-slate-100 text-slate-400"
                                        onClick={() => setKey("")}
                                    >
                                        <XIcon className="size-4" />
                                    </button>
                                ) : null
                            }
                            classNames={{
                                inputWrapper: ["bg-white/90"],
                                input: ["text-[1.75rem] sm:text-[2rem] font-light"],
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") setKey("");
                            }}
                            onValueChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">

                        <span className="h-8 inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-1">
                            <BookOpenText className="size-4" />
                            {readingTime}
                        </span>


                        <span className="h-8 inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700">
                            <Dropdown>
                                <DropdownTrigger className="bg-slate-100">
                                    <Button className="capitalize">
                                        {selectedValue.name}
                                        <ChevronDown />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Bible translation selection"
                                    selectedKeys={selectedTranslations}
                                    selectionMode="single"
                                    variant="flat"
                                    onSelectionChange={(keys) => {
                                        const newSelectedTranslations = new Set(keys as Set<string>);
                                        setSelectedTranslations(newSelectedTranslations);
                                        if (key) {
                                            const newSelected = Array.from(newSelectedTranslations)[0];
                                            const newSelectedTranslation = translations[newSelected as keyof typeof translations];
                                            setTranslation(newSelectedTranslation.abbr);
                                            // getPassage(key, newSelectedTranslation.abbr).then((response: any) => {
                                            //   setPassage(response);
                                            //   calculateReadingTime(response);
                                            //   setLoading(false);
                                            // });
                                        }
                                    }}
                                >
                                    {Object.entries(translations).map(([key, translation]) => (
                                        <DropdownItem className="bg-slate-100 text-black" key={key}>{translation.name}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        </span>

                        {playing ? null : (
                            <Button
                                onPress={playAudio}
                                className="h-8 inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-4 border border-[2px] border-slate-100 hover:bg-primary hover:text-white"
                                color="default"
                            >
                                {audioLoading ? (
                                    <Spinner color="primary" size="sm" />
                                ) : (
                                    <>
                                        <HeadphonesIcon className="size-4" /> Listen
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                    {playing ? (
                        <AudioPlayer src={current} onClose={() => setPlaying(false)} />
                    ) : null}
                </div>
            </div>

            {/* Reading area */}
            <div>
                {loading ? (
                    <div className="flex justify-center py-24">
                        <Spinner color="primary" />
                    </div>
                ) : passage.verses ? (

                    <div>
                        <Context passageKey={key} context="before" />
                        <article className="mt-6 sm:mt-8">
                            {verses}
                        </article>
                        <Context passageKey={key} context="after" />

                        <div className="mt-8 sm:mt-10">
                            <ReadAction
                                state={props.state}
                                book={splitKey.book}
                                chapter={splitKey.chapter}
                                verseStart={splitKey.verseStart}
                                verseEnd={splitKey.verseEnd}
                            />
                            <Button
                                as={Link}
                                href={`/study/${splitKey.book.replace(/\s/g, "")}${splitKey.chapter
                                    }`}
                                className="ml-3 rounded-xl text-white bg-gradient-to-tr from-violet-600 to-violet-700 shadow hover:brightness-110"
                            >
                                <GraduationCapIcon className="size-4" />
                                Study {splitKey.book} {splitKey.chapter}
                            </Button>
                        </div>
                    </div>
                ) : null}
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
        Ezra: "Ezra",
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
        Hab: "Habakkuk",
        Obad: "Obadiah",
        Jonah: "Jonah",
        Mic: "Micah",
        Nah: "Nahum",
        Zeph: "Zephaniah",
        Hag: "Haggai",
        Zech: "Zechariah",
        Mal: "Malachi",
        Matt: "Matthew",
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
        Gal: "Galatians",
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
        Jude: "Jude",
    };

    return map[osis];
};