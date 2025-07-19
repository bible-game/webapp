"use client"

/**
 * Local Storage-related Utilities
 * @since 6th June 2025
 */
export class StorageUtil {

    /** Retrieves a specified item from localstorage */
    static retrieve(item: string): string | null {
        return localStorage.getItem(item);
    }

    /** Stores a specified item in localstorage */
    static save(key: string, item: any): any {
        localStorage.setItem(key, JSON.stringify(item));
        return item
    }

}