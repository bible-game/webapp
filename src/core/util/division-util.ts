/**
 * Names of the Bible's divisions and testaments, as the interface shows them
 * @since 13th October 2026
 */
export class DivisionUtil {

    /** A division's name in sentence case ("Paul's Letters" → "Paul's letters"); "the Law" keeps its capital */
    static sentenceCase(name: string): string {
        return name.split(" ").map((word, i) => i === 0 || word === "Law" ? word : word.toLowerCase()).join(" ");
    }

    /** A testament's full name, whether the data says "New" or "New Testament" */
    static testament(name: string): string {
        return /testament$/i.test(name) ? name : `${name} Testament`;
    }

    /** Where a chapter sits, e.g. "Paul's letters, New Testament" */
    static place(division: string, testament: string): string {
        return `${DivisionUtil.sentenceCase(division)}, ${DivisionUtil.testament(testament)}`;
    }
}
