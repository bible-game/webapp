"use client"

import React, { useMemo, useState } from "react";
import ScrollProgress from "@/app/read/[[...passage]]/scroll-progress";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { getPassage } from "@/core/action/read/get-passage";
import { Spinner } from "@heroui/react";
import Context from "@/app/read/[[...passage]]/context";
import ReadAction from "@/app/read/[[...passage]]/readaction";
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";
import { Button } from "@heroui/react";
import { getAudio } from "@/core/action/read/get-audio";
import Link from "next/link";
import { ChevronDown, HeadphonesIcon, GraduationCapIcon } from "lucide-react";
import { AudioPlayer } from "@/app/read/[[...passage]]/audio-player";
import { useQuery } from "@tanstack/react-query";
import translations from "./translations.json";
import { ReadingUtil } from "@/core/util/reading-util";


const usePassage = (passageKey: string, translation?: string) => {
    return useQuery({
        queryKey: ['passage', passageKey, translation],
        queryFn: () => getPassage(passageKey, translation),
        staleTime: Infinity,
        enabled: !!passageKey,
    });
}

export default function Content(props: any) {
    const [key, setKey] = useState(props.passageKey ? prettyPassage(Array.isArray(props.passageKey) ? props.passageKey[0] : props.passageKey) : "1 John 4 : 7 - 19");
    const [draft, setDraft] = useState<string | null>(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [current, setCurrent] = useState("");
    const [selectedTranslations, setSelectedTranslations] = useState(new Set(["web"]));
    const [translation, setTranslation] = useState<string>(translations["web"].abbr);

    function prettyPassage(passage: string): string {
        return passage.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, "$& ");
    }

    const { data: passage, isLoading: loading, isError, refetch } = usePassage(key, translation);

    const readingTime = useMemo(() => {
        const minutes = ReadingUtil.calcMinutes(passage?.text);
        if (minutes) return minutes + " min";
    }, [passage]);

    const selectedValue = useMemo(() => {
        const selectedTranslation = Array.from(selectedTranslations)[0];
        return translations[selectedTranslation as keyof typeof translations];
    }, [selectedTranslations]);

    const verses = passage?.verses ? (
        <p className="reading-prose">
            {passage.verses.map((verse: any) => (
                <span key={verse.verse} id={`v${verse.verse}`}>
                    <sup>{verse.verse}</sup>{verse.text.trim()}{" "}
                </span>
            ))}
        </p>
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

    function commitDraft(): void {
        if (draft !== null && draft.trim()) setKey(draft.trim());
        setDraft(null);
    }

    const splitKey = useMemo(() => (key ? split(key) : { book: "", chapter: "", verseStart: undefined, verseEnd: undefined }), [key]);

    const title = useMemo(() => {
        if (!splitKey.book) return key;
        const verses = splitKey.verseStart
            ? `:${splitKey.verseStart}${splitKey.verseEnd ? `–${splitKey.verseEnd}` : ""}`
            : "";
        return `${splitKey.book} ${splitKey.chapter}${verses}`;
    }, [key, splitKey]);

    return (
        <section className={`mx-auto w-full max-w-[40rem] ${playing ? "pb-28" : ""}`}>
            <ScrollProgress
                className="bg-[#555b64]"
                height={3}
            />

            {/* Passage header */}
            <header className="mb-3 sm:mb-6">
                <h1 className="m-0">
                    {draft === null ? (
                        <button
                            type="button"
                            aria-label={`Passage: ${title}. Change passage`}
                            className="reading-title -mx-1 inline-flex min-h-12 max-w-full items-center gap-2 rounded-lg px-1 text-left text-[#25272b] hover:bg-[#eef0f2]"
                            onClick={() => setDraft(key)}
                        >
                            <span className="truncate">{title}</span>
                            <ChevronDown aria-hidden className="size-5 shrink-0 text-[#68717c]" />
                        </button>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); commitDraft(); }}>
                            <input
                                aria-label="Passage"
                                autoFocus
                                enterKeyHint="go"
                                placeholder="e.g. John 3:16"
                                className="reading-title min-h-12 w-full rounded-lg border border-[#ced2d7] bg-white px-3 text-[#25272b] outline-none focus:border-[#555b64]"
                                value={draft}
                                onFocus={(e) => e.currentTarget.select()}
                                onChange={(e) => setDraft(e.target.value)}
                                onBlur={commitDraft}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") setDraft(null);
                                }}
                            />
                        </form>
                    )}
                </h1>

                <div className="mt-1 flex items-center gap-1 whitespace-nowrap text-sm text-[#555b64]">
                    <Dropdown classNames={{ content: "rounded-lg bg-ui-surface text-ui-text border border-ui-line max-w-[calc(100vw-2rem)]" }}>
                        <DropdownTrigger>
                            <Button
                                aria-label={`Translation: ${selectedValue.name}`}
                                className="ui-button -ml-3 min-w-0 !border-transparent !bg-transparent px-3 uppercase hover:!bg-[#eef0f2]"
                            >
                                {selectedValue.abbr}
                                <ChevronDown className="size-4" />
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
                                const newSelected = Array.from(newSelectedTranslations)[0];
                                setTranslation(translations[newSelected as keyof typeof translations].abbr);
                            }}
                        >
                            {Object.entries(translations).map(([key, translation]) => (
                                <DropdownItem className="text-ui-text" key={key}>{translation.name}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>

                    {readingTime ? (
                        <>
                            <span aria-hidden className="-ml-2 mr-1">·</span>
                            <span>{readingTime}</span>
                        </>
                    ) : null}

                    {playing ? null : (
                        <Button
                            isIconOnly
                            onPress={playAudio}
                            aria-label="Listen to passage"
                            isDisabled={audioLoading}
                            className="ui-icon ml-auto -mr-2 bg-transparent"
                        >
                            {audioLoading ? (
                                <Spinner color="default" size="sm" />
                            ) : (
                                <HeadphonesIcon className="size-5" />
                            )}
                        </Button>
                    )}
                </div>
            </header>

            {playing ? (
                <AudioPlayer src={current} onClose={() => setPlaying(false)} />
            ) : null}

            {/* Reading area */}
            <div>
                {loading ? (
                    <div className="reading-skeleton" role="status" aria-label="Loading passage">
                        {[96, 88, 92, 70, 94, 84, 60].map((width, i) => (
                            <span key={i} style={{ width: `${width}%` }} />
                        ))}
                    </div>
                ) : isError ? (
                    <div role="alert" className="flex flex-col items-start gap-3 py-8">
                        <p>Unable to load this passage.</p>
                        <button type="button" className="ui-button" onClick={() => refetch()}>Try again</button>
                    </div>
                ) : passage?.verses ? (

                    <div>
                        <Context passageKey={key} context="before" />
                        <article className="my-4">
                            {verses}
                        </article>
                        <Context passageKey={key} context="after" />

                        <div className="mt-10 grid grid-cols-2 gap-3 sm:flex">
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
                                aria-label={`Study ${splitKey.book} ${splitKey.chapter}`}
                                className="ui-button"
                            >
                                <GraduationCapIcon className="size-4" />
                                Study
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div role="alert" className="flex flex-col items-start gap-3 py-8 text-[#555b64]">
                        <p>No passage found for “{key}”. Try a reference like John 3:16.</p>
                        <button type="button" className="ui-button" onClick={() => setDraft(key)}>Change passage</button>
                    </div>
                )}
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
