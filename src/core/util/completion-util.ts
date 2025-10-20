"use client"

import { StateUtil } from "@/core/util/state-util";
import { StorageUtil } from "@/core/util/storage-util";
import { ReadState } from "@/core/model/state/read-state";
import { GameState } from "@/core/model/state/game-state";

/**
 * Completion-related Utilities
 * @since 9th May 2025
 */
export class CompletionUtil {

    /** Calculates the stars a user has */
    static calcStars() {
        let stars = 0;

        for (const state of StateUtil.getAllGames().values())
            stars += state.stars;

        for (const state of StateUtil.getAllReviews().values())
            stars += state.stars;

        return stars;
    }

    /** Calculates the number of games a user has played */
    static calcGames() {
        return StateUtil.getAllGames().size;
    }

    /** Calculates the user's streak */
    static calcStreak() {
        // Get users game as list by ID
        const gamesMap = StateUtil.getAllGames()
        if (!gamesMap || gamesMap.size === 0) return 0;

        const games = Array.from(gamesMap.values())
        const sortedGames = games.filter(g => g.stars !==0 && g.createdDate)
            .sort( (a,b) =>
                new Date(b.createdDate!).getTime() - new Date(a.createdDate!).getTime())
        if (!sortedGames || sortedGames.length == 0) return 0;

        let streak = 0
        let previousDate = null

        // increment streak for each consistent daily game
        for (const game of sortedGames) {
            if (!game.createdDate) continue;
            const currentDate = new Date(game.createdDate)
            const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

            if (!previousDate) {
                streak = 1;
            } else {
                const diffDays = (previousDate.getTime() - day.getTime()) / (1000 * 60 * 60 * 24);

                if (diffDays === 1) {
                    streak++;
                } else if (diffDays > 1) {
                    // streak complete
                    break;
                }
            }

            previousDate = day;
        }
        return streak;
    }

    /** Calculates the % Bible that the user has seen */
    static calcPercentageCompletion(config: any, decimalPlaces: number = 2): string {
        const completion = CompletionUtil.build(config);
        let completedVerses = 0;

        for (const book of Object.values(completion)) {
            for (const chapter of (book as any).chapters) {
                for (const verse of chapter.verses) {
                    if (verse !== '') completedVerses++
                }
            }
        }

        return (100 * completedVerses / 31_102).toFixed(decimalPlaces);
    }

    /** Builds, saves and returns Bible completion */
    static build(config: any): any {
        const completion = this.initialise(config);

        StateUtil.getAllGames().forEach((game: GameState) => {
            const book = completion[game.passageBook.toLowerCase().replace(/ /g, "")];
            const chapter = book.chapters[parseInt(game.passageChapter) - 1];
            chapter.verses.forEach((verse: number, index: number, arr: any) => {
                arr[index] = 0;
            })
        });

        StateUtil.getAllReads().forEach((read: ReadState) => {
            const book = completion[read.book.toLowerCase().replace(/ /g, "")];
            const chapter = book.chapters[parseInt(read.chapter) - 1];
            if (read.verseEnd) { // range
                chapter.verses.forEach((verse: number, index: number, arr: any) => {
                    if (parseInt(read.verseStart) - 1 <= index && parseInt(read.verseEnd) - 1 >= index)
                        arr[index] = !verse ? 1 : verse++
                })
            } else if (read.verseStart) { // bottom only; // fixme :: faulty logic?
                chapter.verses.forEach((verse: number, index: number, arr: any) => {
                    if (parseInt(read.verseStart) - 1 <= index)
                        arr[index] = !verse ? 1 : verse++
                })
            } else { // full
                chapter.verses.forEach((verse: number, index: number, arr: any) => {
                    arr[index] = !verse ? 1 : verse++
                })
            }

            book.chapters[parseInt(read.chapter) - 1] = chapter;
            completion[read.book.toLowerCase().replace(/ /g, "")] = book;
        })

        return StorageUtil.save('completion', completion);
    }

    /** Initialises an empty completion if it doesn't exist */
    static initialise(config: any): any {
        let completion: any = StorageUtil.retrieve('completion');
        if (completion) return JSON.parse(completion);
        else completion = {};

        for (const testament of config.testaments) {
            for (const division of testament.divisions) {
                for (const book of division.books) {
                    const bk = {} as any;
                    const bookName = book.name.toLowerCase().replace(/ /g, "");
                    bk['book'] = bookName
                    bk['pretty'] = book.name
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

                    completion[bookName] = bk;
                }
            }
        }

        return completion;
    }

}