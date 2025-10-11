/**
 * Read Response V2 Models
 * Based on the bolls.life API integration
 * @since 11th October 2025
 */

export type VersionInfo = {
    code: string;
    name?: string;
    language?: string;
}

export type BookResponse = {
    bookId: string;
    name: string;
    chapters: number;
    testament?: string;
}

export type VerseResponse = {
    pk: number;
    verse: number;
    text: string;
}

export type ReadResponseV2 = {
    version: string;
    bookId: string;
    bookName: string;
    chapter: number;
    verses: VerseResponse[];
    cached: boolean;
}
