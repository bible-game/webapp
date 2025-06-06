"use client"

/**
 * Service logic for interacting with localstorage
 * @since 6th June 2025
 */
export class LocalStorageService {

    /** Retrieves a specified item from localstorage */
    static retrieve(item: string): string | null {
        return localStorage.getItem(item);
    }

}