/**
 * Daily Player Stats Model
 * @since 28th February 2026
 */
export type DailyPlayerStats = {
    date: string
    totalCount: number
    loggedInCount: number
    anonymousCount: number
    lastUpdated: string | null
}
