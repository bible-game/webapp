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

    static getGameStates(): Map<string, GameStates> {
        const json = localStorage.getItem('game-states') || '[]';
        return new Map(JSON.parse(json));
    }

    static updateCompletion(book: string, chapter: number, read: boolean) {
        const completion = this.getCompletion();

        completion.forEach(c =>  {
            if (c.book != book.toLowerCase().replace(/\s/g, "")) return;

            c.chapter[chapter - 1] = read ? 2 : 1;
        });

        localStorage.setItem('completion', JSON.stringify(completion));
    }

    static getCompletion(): any[] {
        const json = localStorage.getItem('completion') || '[]'
        return JSON.parse(json);
    }

    static initCompletion(): void {
        if (!!localStorage.getItem('completion')) return;

        const completion = [
            {
                book: "genesis",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0]
            },
            {
                book: "exodus",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0]
            },
            {
                book: "leviticus",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0]
            },
            {
                book: "numbers",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0, 0]
            },
            {
                book: "deuteronomy",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0]
            },

            {
                book: "joshua",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
            },
            {
                book: "judges",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0]
            },
            {
                book: "ruth",
                chapter: [0,0,0,0]
            },
            {
                book: "1samuel",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0]
            },
            {
                book: "2samuel",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
            },
            {
                book: "1kings",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0]
            },
            {
                book: "2kings",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0]
            },
            {
                book: "1chronicles",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
            },
            {
                book: "2chronicles",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0, 0,0]
            },
            {
                book: "ezra",
                chapter: [0,0,0,0,0, 0,0,0,0,0]
            },
            {
                book: "nehemiah",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0]
            },
            {
                book: "esther",
                chapter: [0,0,0,0,0, 0,0,0,0,0]
            },

            {
                book: "job",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0]
            },
            {
                book: "psalms",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0]
            },
            {
                book: "proverbs",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0]
            },
            {
                book: "ecclesiastes",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,]
            },
            {
                book: "songofsolomon",
                chapter: [0,0,0,0,0, 0,0,0]
            },

            {
                book: "isaiah",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0]
            },
            {
                book: "jeremiah",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0]
            },
            {
                book: "lamentations",
                chapter: [0,0,0,0,0]
            },
            {
                book: "ezekiel",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,]
            },
            {
                book: "daniel",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,]
            },

            {
                book: "hosea",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
            },
            {
                book: "joel",
                chapter: [0,0,0,0]
            },
            {
                book: "amos",
                chapter: [0,0,0,0,0, 0,0,0,0,]
            },
            {
                book: "obadiah",
                chapter: [0,]
            },
            {
                book: "jonah",
                chapter: [0,0,0,0]
            },
            {
                book: "micah",
                chapter: [0,0,0,0,0, 0,0]
            },
            {
                book: "nahum",
                chapter: [0,0,0,]
            },
            {
                book: "habakkuk",
                chapter: [0,0,0,]
            },
            {
                book: "zephaniah",
                chapter: [0,0,0,]
            },
            {
                book: "haggai",
                chapter: [0,0,]
            },
            {
                book: "zechariah",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]
            },
            {
                book: "malachi",
                chapter: [0,0,0,]
            },

            {
                book: "mathew",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,]
            },
            {
                book: "mark",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0]
            },
            {
                book: "luke",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0]
            },
            {
                book: "john",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,]
            },

            {
                book: "acts",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,0,0,0,0 ,0,0,0,0,0 ,0,0,0]
            },

            {
                book: "romans",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,]
            },
            {
                book: "1corinthians",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0 ,0,]
            },
            {
                book: "2corinthians",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,]
            },
            {
                book: "galatians",
                chapter: [0,0,0,0,0, 0,]
            },
            {
                book: "ephesians",
                chapter: [0,0,0,0,0, 0,]
            },
            {
                book: "philippians",
                chapter: [0,0,0,0]
            },
            {
                book: "colossians",
                chapter: [0,0,0,0,]
            },
            {
                book: "1thessalonians",
                chapter: [0,0,0,0,0,]
            },
            {
                book: "2thessalonians",
                chapter: [0,0,0,]
            },
            {
                book: "1timothy",
                chapter: [0,0,0,0,0, 0,]
            },
            {
                book: "2timothy",
                chapter: [0,0,0,0]
            },
            {
                book: "titus",
                chapter: [0,0,0,]
            },
            {
                book: "philemon",
                chapter: [0,]
            },
            {
                book: "hebrews",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,]
            },

            {
                book: "james",
                chapter: [0,0,0,0,0,]
            },
            {
                book: "1peter",
                chapter: [0,0,0,0,0]
            },
            {
                book: "2peter",
                chapter: [0,0,0]
            },
            {
                book: "1john",
                chapter: [0,0,0,0,0,]
            },
            {
                book: "2john",
                chapter: [0,]
            },
            {
                book: "3john",
                chapter: [0,]
            },
            {
                book: "jude",
                chapter: [0,]
            },

            {
                book: "revelation",
                chapter: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,]
            },
        ]

        GameStatesService.setState(completion);
    }

    static setState(state: any) {
        localStorage.setItem('completion', JSON.stringify(state));
    }

}

export type GameStates = {
    stars?: number
    guesses: any[]
    playing: boolean
}