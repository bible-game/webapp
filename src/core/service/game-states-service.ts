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
        const json = localStorage.getItem('game-states') ?? '[]';
        return new Map(JSON.parse(json));
    }

    static getStudies(): Map<string, any> {
        const json = localStorage.getItem('studies') ?? '[]';
        return new Map(JSON.parse(json));
    }

    static updateCompletion(
        read: boolean,
        book: string,
        chapter: number,
        verseStart: number | undefined = undefined,
        verseEnd: number | undefined = undefined) {
        const completion = this.getCompletion();

        completion.forEach(c =>  {
            if (c.book != book &&
                c.book.replace(/\s/g, "") != book &&
                c.book != book.replace(/\s/g, "") &&
                c.book != book.toLowerCase().replace(/\s/g, "")) return;

            const ch = c.chapters[chapter - 1];
            for (let i = 0; i < ch.verses.length; i++) {
                if (!read) {
                    ch.verses[i] = 0;
                } else {
                    if (!verseStart) {
                        ch.verses[i] = 1;
                    } else if (verseStart) {
                        if (verseEnd) {
                            if (i - 1 >= verseStart && i < verseEnd) ch.verses[i - 1] = 1;
                        } else {
                            ch.verses[verseStart - 1] = 1;
                        }
                    }
                }

                c.chapters[chapter - 1] = ch;
            }
        });

        localStorage.setItem('completion', JSON.stringify(completion));
    }

    static getCompletion(): any[] {
        const json = localStorage.getItem('completion') ?? '[]'
        return JSON.parse(json);
    }

    static initCompletion(config: any): void {
        if (!!localStorage.getItem('completion')) return;

        let completion = [];
        for (const testament of config) {
            for (const division of testament.divisions) {
                for (const book of division.books) {
                    const bk = {} as any;

                    bk['book'] = book.name;
                    bk['chapters'] = [];
                    for (let i = 0; i < book.chapters; i++) {
                        bk['chapters'].push({
                            chapter: i + 1,
                            verses: []
                        });

                        for (let j = 1; j <= book.verses[i]; j++) {
                            bk['chapters'][i].verses.push('');
                        }
                    }

                    completion.push(bk);
                }
            }
        }

        localStorage.setItem('completion', JSON.stringify(completion));
    }

    static getStudy(passageKey: string) {
        let study = this.getStudies().get(passageKey)
        study ??= {stars: undefined, answers: [], passageKey: "", date: "", summary: "", gradingResult: null};
        return study
    }

    static setStudy(stars: number | undefined, answers: any[], passageKey: string, date: string, summary: string, gradingResult: { score: number; message: string } | null) {
        const studies = this.getStudies()
        let study = this.getStudy(passageKey)

        study.answers = answers
        study.stars = stars
        study.passageKey = passageKey
        study.date = date
        study.summary = summary
        study.gradingResult = gradingResult
        studies.set(passageKey, study)
        localStorage.setItem('studies', JSON.stringify(Array.from(studies.entries())))
    }

}

export type GameStates = {
    stars?: number
    guesses: any[]
    playing: boolean
}