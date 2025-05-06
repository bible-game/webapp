"use client"

export class GameStatesService {

    static getStateForDate(date: string) {
        const gameStats = this.getGameStates()
        let statsForDate = gameStats.get(date)
        if (!statsForDate) {
            statsForDate = { stars: undefined, guesses: [], playing: true}
        }
        return statsForDate
    }

    static setStateForDate(stars: number | undefined, guesses: any[], playing: boolean, date: string) {
        const gameStates = this.getGameStates()
        let stateForDate = this.getStateForDate(date)

        stateForDate.guesses = guesses
        stateForDate.stars = stars
        stateForDate.playing = playing
        gameStates.set(date, stateForDate)
        localStorage.setItem('game-states', JSON.stringify(Array.from(gameStates.entries())))
    }

    private static getGameStates(): Map<string, GameStates> {
        const json = localStorage.getItem('game-states') || '[]'
        return new Map(JSON.parse(json))
    }

}

export type GameStates = {
    stars?: number
    guesses: any[]
    playing: boolean
}