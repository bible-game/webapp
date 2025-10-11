"use server"

import { ReadResponseV2 } from "@/core/model/read/read-response-v2";
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";

/**
 * Parse passage key to extract book, chapter, and verse information
 */
function parsePassageKey(passageKey: string): {
    book: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
} {
    const bcv = new bcv_parser(lang);
    const osis = bcv.parse(passageKey).osis();

    const hasVerses = osis.includes("-");

    if (hasVerses) {
        const [first, second] = osis.split("-");
        const firstParts = first.split(".");
        const secondParts = second.split(".");

        return {
            book: osisToName(firstParts[0]) || "",
            chapter: parseInt(firstParts[1]) || 1,
            verseStart: firstParts[2] ? parseInt(firstParts[2]) : undefined,
            verseEnd: secondParts[2] ? parseInt(secondParts[2]) : undefined,
        };
    } else {
        const parts = osis.split(".");
        return {
            book: osisToName(parts[0]) || "",
            chapter: parseInt(parts[1]) || 1,
            verseStart: undefined,
            verseEnd: undefined,
        };
    }
}

/**
 * Convert OSIS book abbreviation to full book name
 */
const osisToName = (osis: string): string => {
    const map: Record<string, string> = {
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

    return map[osis] || osis;
};

export async function getPassage(passageKey: string, version: string = "NIV"): Promise<ReadResponseV2> {
    const { book, chapter, verseStart, verseEnd } = parsePassageKey(passageKey);

    // Use the new ReadV2 API endpoint
    const url = `${process.env.SVC_PASSAGE}/v2/read/chapter-by-name/${version}/${encodeURIComponent(book)}/${chapter}`;
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
        throw new Error(`Failed to fetch passage: ${response.statusText}`);
    }

    const data: ReadResponseV2 = await response.json();

    // If specific verses were requested, filter the response
    if (verseStart !== undefined && verseEnd !== undefined) {
        return {
            ...data,
            verses: data.verses.filter(v => v.verse >= verseStart && v.verse <= verseEnd)
        };
    }

    return data;
}