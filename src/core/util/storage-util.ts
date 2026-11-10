"use client"

/**
 * Local Storage-related Utilities
 * @since 6th June 2025
 */
export class StorageUtil {

    private static owner: string | null | undefined;
    private static generation = 0;
    private static readonly scoped = new Set(['games', 'reads', 'reviews', 'synced', 'completion']);

    static readonly CHANGED = "bible-game:state";

    static getOwner(): string | null | undefined { return this.owner; }
    static scopeToken(): string { return `${this.owner}:${this.generation}`; }
    static selectOwner(owner: string | null): void {
        this.owner = owner;
        this.generation++;
    }

    static key(item: string, owner = this.owner): string {
        return owner === undefined || !this.scoped.has(item) ? item : `bible-game:${owner === null ? 'guest' : `account:${owner}`}:${item}`;
    }

    /** Retrieves a specified item from localstorage */
    static retrieve(item: string): string | null {
        return localStorage.getItem(this.key(item));
    }

    /** Stores a specified item in localstorage */
    static save(key: string, item: any): any {
        localStorage.setItem(this.key(key), JSON.stringify(item));
        window.dispatchEvent(new Event(StorageUtil.CHANGED));
        return item
    }

}
