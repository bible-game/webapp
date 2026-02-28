"use client"

import { GameState } from "@/core/model/state/game-state";
import { StorageUtil } from "@/core/util/storage-util";
import { ReviewState } from "@/core/model/state/review-state";
import getReadKey, { ReadState } from "@/core/model/state/read-state";

/**
 * State-related Utilities
 * @since 24th June 2025
 */
export class StateUtil {

    /** Gets the games-state for a given passage */
    static getGame(passageId: number): GameState {
        const allGames = this.getAllGames();

        return allGames.get(passageId)
            ?? { stars: 0, guesses: [], passageBook: '', passageChapter: '', playing: true, passageId }
    }

    /** Gets the review-state for a given passage */
    static getReview(passageKey: string): ReviewState {
        const allReviews = this.getAllReviews();

        return allReviews.get(passageKey)
            ?? { date: '', answers: [], summary: '', stars: 0, gradingResult: null, passageKey }
    }

    /** Gets the read-state for a given passage */
    static getRead(passageKey: string): ReadState {
        const allReads = this.getAllReads();

        return allReads.get(passageKey)
            ?? { book: '', chapter: '', verseStart: '', verseEnd: '', passageKey: '' }
    }

    /** Sets the game-state for a given passage */
    static setGame(state: GameState): void {
        const allGames = this.getAllGames();

        const thisGame = this.getGame(state.passageId);
        thisGame.stars = state.stars;
        thisGame.playing = state.playing;
        thisGame.guesses = state.guesses;
        thisGame.passageId = state.passageId;
        thisGame.passageBook = state.passageBook;
        thisGame.passageChapter = state.passageChapter;
        allGames.set(state.passageId, thisGame);

        StorageUtil.save('games', Array.from(allGames.entries()));
    }

    /** Returns all games mapped to their passage */
    static getAllGames(): Map<number, GameState> {
        const json = StorageUtil.retrieve('games') ?? '[]';
        return new Map(JSON.parse(json));
    }

    /** Returns all games mapped to their passage */
    static getAllReads(): Map<string, ReadState> {
        const json = StorageUtil.retrieve('reads') ?? '[]';
        return new Map(JSON.parse(json));
    }

    /** Returns all games mapped to their passage */
    static getAllReviews(): Map<string, ReviewState> {
        const json = StorageUtil.retrieve('reviews') ?? '[]';
        return new Map(JSON.parse(json));
    }

    /** Returns the user's consent */
    static getConsent():boolean {
        const json = StorageUtil.retrieve('consent') ?? 'false';
        return JSON.parse(json);
    }

    /** Sets the overall game state object */
    static setAllGame(states: Map<number, GameState>): void {
        //@ts-ignore
        StorageUtil.save('games', Array.from(states));
    }

    /** Sets the overall review state object */
    static setAllReviews(states: Map<number, ReviewState>): void {
        //@ts-ignore
        StorageUtil.save('reviews', Array.from(states));
    }

    /** Sets the overall review state object */
    static setAllReads(states: Map<number, ReadState>): void {
        //@ts-ignore
        StorageUtil.save('reads', Array.from(states));
    }

    /** Sets the read-state for a given passage */
    static setRead(state: ReadState): void {
        const key = getReadKey(state);
        const allReads = this.getAllReads();

        const thisRead = this.getRead(key);
        thisRead.book = state.book;
        thisRead.chapter = state.chapter;
        thisRead.verseStart = state.verseStart;
        thisRead.verseEnd = state.verseEnd;
        thisRead.passageKey = state.passageKey;
        allReads.set(key, thisRead);

        StorageUtil.save('reads', Array.from(allReads.entries()));
    }

    /** Sets the review-state for a given passage */
    static setReview(state: ReviewState): void {
        const allReviews = this.getAllReviews();

        const thisReview = this.getReview(state.passageKey);
        thisReview.stars = state.stars;
        thisReview.summary = state.summary;
        thisReview.gradingResult = state.gradingResult;
        thisReview.answers = state.answers;
        thisReview.date = state.date;
        allReviews.set(state.passageKey, thisReview);

        StorageUtil.save('reviews', Array.from(allReviews.entries()));
    }

    /** Sets the consent for the user */
    static setConsent(consent : boolean) : void {
        //@ts-ignore
        StorageUtil.save('consent', consent);
    }
}