import moment from "moment";
import { Book, findBook } from "@/core/model/bible/books";

/** The format reviews store their completion date in */
export const REVIEW_DATE_FORMAT = "dddd, MMMM Do YYYY, h:mm:ss a";

/** A study's key, as used in its address and saved state (e.g. "1John4") */
export function studyKey(book: string, chapter: number | string): string {
    return `${book.replace(/\s/g, "")}${chapter}`;
}

/** The book and chapter in a study key (e.g. "1John4" → 1 John, 4) */
export function parseStudyKey(key: string): { book?: Book; chapter: number } {
    let k = key;
    try { k = decodeURIComponent(key); } catch { /* already decoded */ }
    const match = k.match(/^(.*?)(\d+)$/);
    return { book: findBook(match?.[1]), chapter: match ? parseInt(match[2], 10) : 1 };
}

/** A review's completion date, or undefined if it can't be read */
export function parseReviewDate(date?: string): Date | undefined {
    if (!date) return undefined;
    const parsed = moment(date, REVIEW_DATE_FORMAT, true);
    return parsed.isValid() ? parsed.toDate() : undefined;
}
