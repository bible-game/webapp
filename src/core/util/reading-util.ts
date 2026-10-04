/**
 * Reading-related Utilities
 * @since 2nd October 2026
 */
export class ReadingUtil {

    static readonly WORDS_PER_MINUTE = 160;

    /** Calculates the minutes needed to read a passage of text */
    static calcMinutes(text?: string): number | undefined {
        if (!text) return undefined;
        return Math.ceil(text.split(" ").length / ReadingUtil.WORDS_PER_MINUTE);
    }
}
