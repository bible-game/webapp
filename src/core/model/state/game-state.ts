/**
 * Game State Model
 * @since 24th June 2025
 */
export type GameState = {
    stars: number
    guesses: any[]
    playing: boolean
    passageId: number,
    passageBook: string,
    passageChapter: string,
    createdDate?: Date,
    lastModified?: Date
}