"use client"

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";
import { ArrowRight, GraduationCapIcon } from "lucide-react";
import AppHeader from "@/core/component/app-header";
import ScrollProgress from "@/app/read/[[...passage]]/scroll-progress";
import Context from "@/app/read/[[...passage]]/context";
import ReaderToolbar from "@/app/read/[[...passage]]/reader-toolbar";
import TypeSheet from "@/app/read/[[...passage]]/type-sheet";
import ContentsSheet from "@/app/read/[[...passage]]/contents-sheet";
import { useReadAction } from "@/app/read/[[...passage]]/readaction";
import { useReaderSettings } from "@/app/read/[[...passage]]/use-reader-settings";
import { useActiveVerse } from "@/app/read/[[...passage]]/use-active-verse";
import { getPassage } from "@/core/action/read/get-passage";
import { getAudio } from "@/core/action/read/get-audio";
import { findBook } from "@/core/model/bible/books";
import { READING_FONTS } from "@/core/style/reading-fonts";
import { ReadingUtil } from "@/core/util/reading-util";
import translations from "./translations.json";


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
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | undefined>();
    const [sheet, setSheet] = useState<"type" | "contents" | null>(null);
    const [settings, updateSettings] = useReaderSettings();
    const proseRef = useRef<HTMLParagraphElement>(null);

    function prettyPassage(passage: string): string {
        try { passage = decodeURIComponent(passage); } catch { /* already decoded */ }
        return passage.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, "$& ");
    }

    const translation = translations[settings.translation as keyof typeof translations] ?? translations.web;
    const { data: passage, isLoading: loading, isError, refetch } = usePassage(key, translation.abbr);
    const activeVerse = useActiveVerse(proseRef, [passage]);

    const readingTime = useMemo(() => {
        const minutes = ReadingUtil.calcMinutes(passage?.text);
        if (minutes) return minutes + " min";
    }, [passage]);

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

    const splitKey = useMemo(() => (key ? split(key) : { book: "", chapter: "", verseStart: undefined, verseEnd: undefined }), [key]);
    const book = findBook(splitKey.book);
    const chapter = Number(splitKey.chapter) || 1;
    const { read, markRead } = useReadAction({ ...splitKey, state: props.state });

    const title = useMemo(() => {
        if (!splitKey.book) return key;
        const verses = splitKey.verseStart
            ? `:${splitKey.verseStart}${splitKey.verseEnd ? `–${splitKey.verseEnd}` : ""}`
            : "";
        return `${book?.name ?? splitKey.book} ${chapter}${verses}`;
    }, [key, splitKey, book, chapter]);

    // Keep the address in step with the passage, so reloading or sharing keeps your place
    useEffect(() => {
        if (!book || !props.passageKey && key === "1 John 4 : 7 - 19") return;
        const verses = splitKey.verseStart ? `:${splitKey.verseStart}${splitKey.verseEnd ? `-${splitKey.verseEnd}` : ""}` : "";
        window.history.replaceState(null, "", `/read/${book.name.replace(/\s/g, "")}${chapter}${verses}`);
    }, [book, chapter, splitKey.verseStart, splitKey.verseEnd]);

    function goTo(passageKey: string): void {
        closeAudio();
        setKey(passageKey);
        window.scrollTo({ top: 0 });
    }

    function playAudio(): void {
        if (!key) return;
        setAudioLoading(true);
        getAudio(key).then((audioBuffer: any) => {
            if (audioBuffer) {
                const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
                setAudioSrc(URL.createObjectURL(audioBlob));
            }
        }).finally(() => setAudioLoading(false));
    }

    function closeAudio(): void {
        if (audioSrc) URL.revokeObjectURL(audioSrc);
        setAudioSrc(undefined);
    }

    const verses = passage?.verses?.map((verse: any, i: number) => {
        const text = verse.text.trim();
        return (
            <span key={verse.verse} id={`v${verse.verse}`} data-v={verse.verse} data-active={activeVerse === String(verse.verse) || undefined}>
                {i === 0 ? (
                    <><sup className="sr-only">{verse.verse}</sup><span aria-hidden className="drop-cap">{text[0]}</span>{text.slice(1)}</>
                ) : (
                    <><sup>{verse.verse}</sup>{text}</>
                )}{" "}
            </span>
        );
    });

    const nextChapter = book && chapter < book.chapters ? chapter + 1 : undefined;

    return (
        <div style={{
            "--reader-font": READING_FONTS[settings.font]?.family,
            "--reader-size": `${settings.size}px`,
            "--reader-leading": settings.leading,
        } as React.CSSProperties}>
            <div className="reader-header">
                <div className="app-header">
                    <AppHeader info={props.info}>
                        <button type="button" onClick={() => setSheet("contents")}
                                aria-label={`${title}, ${translation.name}. Open contents`}
                                className="flex min-w-0 max-w-[60vw] flex-col items-center rounded-lg px-3 py-1 hover:bg-white/5">
                            <span className="reader-title truncate">{title}</span>
                            <span className="truncate text-[11px] text-[var(--reader-muted)]">{translation.name}</span>
                        </button>
                    </AppHeader>
                </div>
                <ScrollProgress />
            </div>

            <main className="app-page !pb-48">
                <section className="mx-auto w-full max-w-[40rem]">
                    {loading ? (
                        <div className="reading-skeleton" role="status" aria-label="Loading passage">
                            {[96, 88, 92, 70, 94, 84, 60].map((width, i) => (
                                <span key={i} style={{ width: `${width}%` }} />
                            ))}
                        </div>
                    ) : isError ? (
                        <div role="alert" className="flex flex-col items-start gap-3 py-8 text-[var(--reader-muted)]">
                            <p>Unable to load this passage.</p>
                            <button type="button" className="ui-button" onClick={() => refetch()}>Try again</button>
                        </div>
                    ) : passage?.verses ? (
                        <>
                            <Context passageKey={key} context="before" />
                            <article className="my-5">
                                <p ref={proseRef} className={`reading-prose ${settings.focus ? "is-focus" : ""}`}>
                                    {verses}
                                </p>
                            </article>
                            <Context passageKey={key} context="after" />

                            <div className="mt-10 grid grid-cols-2 gap-3 sm:flex">
                                {nextChapter ? (
                                    <button type="button" className="ui-button reader-primary" onClick={() => goTo(`${book!.name} ${nextChapter}`)}>
                                        {book!.name} {nextChapter}
                                        <ArrowRight className="size-4" />
                                    </button>
                                ) : null}
                                <Link href={`/study/${splitKey.book.replace(/\s/g, "")}${chapter}`}
                                      aria-label={`Study ${title}`} className="ui-button">
                                    <GraduationCapIcon className="size-4" />
                                    Study
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div role="alert" className="flex flex-col items-start gap-3 py-8 text-[var(--reader-muted)]">
                            <p>No passage found for “{key}”. Try a reference like John 3:16.</p>
                            <button type="button" className="ui-button" onClick={() => setSheet("contents")}>Choose a passage</button>
                        </div>
                    )}
                </section>
            </main>

            <ReaderToolbar
                book={book}
                chapter={chapter}
                onChapter={(n) => book && goTo(`${book.name} ${n}`)}
                onType={() => setSheet("type")}
                onContents={() => setSheet("contents")}
                audio={{ src: audioSrc, loading: audioLoading, onListen: playAudio, onClose: closeAudio }}
                read={read}
                onRead={markRead}
            />

            <TypeSheet open={sheet === "type"} onOpenChange={(open) => setSheet(open ? "type" : null)}
                       settings={settings} update={updateSettings} />
            <ContentsSheet open={sheet === "contents"} onOpenChange={(open) => setSheet(open ? "contents" : null)}
                           book={book} chapter={chapter} readingTime={readingTime} onGo={goTo} />
        </div>
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
