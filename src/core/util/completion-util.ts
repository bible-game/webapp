"use client"

import { StateUtil } from "@/core/util/state-util";
import {StorageUtil} from "@/core/util/storage-util";

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
        // TODO
        return 0;
    }

    /** Calculates the % Bible the user has 'seen' */
    static calcPercentageCompletion(){
        // let completed = 0;
        //
        // for (const book of StateService.getCompletion()) {
        //     for (const chapter of book.chapters) {
        //         for (const verse of chapter.verses) {
        //             if (verse != '') completed++
        //         }
        //     }
        // }
        //
        // return (100 * completed / 31_102).toFixed(2);

        // todo
        return 0;
    }

    /** Builds, saves and returns Bible completion */
    static build(config: any): any {
        const completion = this.initialise(config);

        // todo
        // StateUtil.getAllGames().forEach()
        // StateUtil.getAllReads().forEach()

        return StorageUtil.save('completion', completion);
    }

    /** Initialises an empty completion if it doesn't exist */
    static initialise(config: any): any {
        let completion: any = StorageUtil.retrieve('completion') ?? [];
        if (completion) return completion;

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
    }

}

/**
 *
 *   static updateCompletion(
 *         read: boolean,
 *         book: string,
 *         chapter: number,
 *         verseStart: number | undefined = undefined,
 *         verseEnd: number | undefined = undefined) {
 *         const completion = this.getCompletion();
 *
 *         completion.forEach(c =>  {
 *             if (c.book != book &&
 *                 c.book.replace(/\s/g, "") != book &&
 *                 c.book != book.replace(/\s/g, "") &&
 *                 c.book != book.toLowerCase().replace(/\s/g, "")) return;
 *
 *             const ch = c.chapters[chapter - 1];
 *             for (let i = 0; i < ch.verses.length; i++) {
 *                 if (!read) {
 *                     ch.verses[i] = 0;
 *                 } else {
 *                     if (!verseStart) {
 *                         ch.verses[i] = 1;
 *                     } else if (verseStart) {
 *                         if (verseEnd) {
 *                             if (i - 1 >= verseStart && i < verseEnd) ch.verses[i - 1] = 1;
 *                         } else {
 *                             ch.verses[verseStart - 1] = 1;
 *                         }
 *                     }
 *                 }
 *
 *                 c.chapters[chapter - 1] = ch;
 *             }
 *         });
 *
 *         localStorage.setItem('completion', JSON.stringify(completion));
 *     }
*/