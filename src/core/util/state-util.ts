"use client"

import { GameState } from "@/core/model/state/game-state";
import { StorageUtil } from "@/core/util/storage-util";
import { ReviewState } from "@/core/model/state/review-state";
import getReadKey, { ReadState } from "@/core/model/state/read-state";
import { isSyncPending } from "@/core/util/sync-cookie";

const STATE_KINDS = ['games', 'reads', 'reviews'] as const;
type StateKind = typeof STATE_KINDS[number];

/** A short hash of a state, to tell whether it has changed since the account last had it */
function fingerprint(state: any): string {
    const json = JSON.stringify(state);
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < json.length; i++) {
        const c = json.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 2654435761);
        h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

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
        this.setAllFromServer('games', states);
    }

    /** Sets the overall review state object */
    static setAllReviews(states: Map<number, ReviewState>): void {
        this.setAllFromServer('reviews', states);
    }

    /** Sets the overall review state object */
    static setAllReads(states: Map<number, ReadState>): void {
        this.setAllFromServer('reads', states);
    }

    /**
     * Replaces a kind of state with the account's copy, which the server already has, so none of it is synced again.
     * While a sync is pending, anything played here that the account hasn't seen is kept rather than lost.
     */
    private static setAllFromServer(kind: StateKind, states: Map<any, any>): void {
        const all = new Map<any, any>(states as any);
        const synced = this.getSynced();
        const fromServer = new Set(all.keys());

        if (isSyncPending()) {
            for (const [key, state] of this.getAll(kind)) {
                if (synced[kind][key] != fingerprint(state)) {
                    all.set(key, state);
                    fromServer.delete(key);
                }
            }
        }

        StorageUtil.save(kind, Array.from(all.entries()));
        synced[kind] = {};
        for (const [key, state] of this.getAll(kind)) {
            if (fromServer.has(key)) synced[kind][key] = fingerprint(state);
        }
        StorageUtil.save('synced', synced);
    }

    /** Returns the games, reads and reviews (by their storage key) changed on this device since the account last had them */
    static getUnsynced(): Record<StateKind, [any, any][]> {
        const synced = this.getSynced();
        const unsynced = (kind: StateKind) => Array.from(this.getAll(kind))
            .filter(([key, state]) => synced[kind][key] != fingerprint(state));

        return { games: unsynced('games'), reads: unsynced('reads'), reviews: unsynced('reviews') };
    }

    /** Records that the account now has these states, so they aren't sent with the next sync */
    static markSynced(states: Record<StateKind, [any, any][]>): void {
        const synced = this.getSynced();
        for (const kind of STATE_KINDS) {
            for (const [key, state] of states[kind]) synced[kind][key] = fingerprint(state);
        }
        StorageUtil.save('synced', synced);
    }

    private static getAll(kind: StateKind): Map<any, any> {
        return new Map(JSON.parse(StorageUtil.retrieve(kind) ?? '[]'));
    }

    /** Fingerprints of each state as the account last had it */
    private static getSynced(): Record<StateKind, Record<string, string>> {
        const saved = JSON.parse(StorageUtil.retrieve('synced') ?? '{}');
        return { games: saved.games ?? {}, reads: saved.reads ?? {}, reviews: saved.reviews ?? {} };
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