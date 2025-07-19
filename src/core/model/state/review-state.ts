/**
 * Review State Model
 * @since 17th July 2025
 */
export type ReviewState = {
    passageKey: string
    date: string
    stars: number
    summary: string
    answers: string[]
    gradingResult: GradingResult
}

export type GradingResult = {
    score: number,
    message: string
} | null;