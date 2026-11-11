import { Passage } from "@/core/model/play/passage";

/**
 * The tutorial's sample day: a real past daily chapter, so the round it shows never gives today's away. Psalm 127 is
 * five verses, and the guesses towards it tell a story about houses. The id is the passage service's (15 April 2025)
 * @since 3rd November 2026
 */
export const PRACTICE = {
    id: 89,
    date: "2025-04-15",
    book: "Psalms",
    chapter: "127",
    summary: "Depend on Yahweh for true success",
    verses: 5,
};

/** The sample day as the Play page takes a day's passage (the Game fills in its division and testament) */
export const practicePassage = (): Passage => ({
    id: PRACTICE.id, title: PRACTICE.summary, summary: PRACTICE.summary, book: PRACTICE.book, chapter: PRACTICE.chapter,
} as unknown as Passage);
