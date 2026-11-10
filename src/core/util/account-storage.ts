"use client";

import { StorageUtil } from "@/core/util/storage-util";

const kinds = ['games', 'reads', 'reviews'] as const;
type Entries = [string | number, any][];
const read = (key: string): Entries => JSON.parse(localStorage.getItem(key) ?? '[]');

/** Keep the server's completed games; extend unfinished games only when the guest has more guesses. */
export function mergeDeviceProgress(existing: Entries, incoming: Entries, games: boolean): Entries {
    const result = new Map(existing);
    for (const [key, state] of incoming) {
        const saved = result.get(key);
        if (!saved || (games && saved.playing && (state.guesses?.length ?? 0) > (saved.guesses?.length ?? 0))) result.set(key, state);
    }
    return Array.from(result);
}

/** Old unscoped account caches remain untouched. Only an identifiable guest's data is imported automatically. */
function importLegacyGuest(): void {
    if (localStorage.getItem('bible-game:storage-migrated')) return;
    const known = document.cookie.split('; ').some(c => c.startsWith('known_user='));
    const synced = JSON.parse(localStorage.getItem('synced') ?? '{}');
    const hadAccountData = Object.values(synced).some(value => value && Object.keys(value).length > 0);
    if (!known && !hadAccountData) {
        for (const kind of kinds) {
            const destination = StorageUtil.key(kind, null);
            localStorage.setItem(destination, JSON.stringify(mergeDeviceProgress(read(destination), read(kind), kind === 'games')));
        }
    }
    localStorage.setItem('bible-game:storage-migrated', '1');
}

/** Transfer under a browser-wide lock so simultaneous tabs cannot assign guest progress to different accounts. */
export async function prepareAccountStorage(owner: string | null): Promise<boolean> {
    importLegacyGuest();
    if (owner === null) return true;
    const hasGuest = kinds.some(kind => read(StorageUtil.key(kind, null)).length > 0);
    if (!hasGuest) return true;
    if (!navigator.locks?.request) return false; // Keep the guest copy intact when safe automatic transfer is unavailable.
    await navigator.locks.request('bible-game:claim-guest-progress', () => {
        const snapshot = kinds.map(kind => ({ kind, key: StorageUtil.key(kind, null), raw: localStorage.getItem(StorageUtil.key(kind, null)) ?? '[]' }));
        // Persist every destination before removing any guest copy: quota/storage failures remain retryable.
        for (const { kind, raw } of snapshot) {
            const target = StorageUtil.key(kind, owner);
            localStorage.setItem(target, JSON.stringify(mergeDeviceProgress(read(target), JSON.parse(raw), kind === 'games')));
        }
        for (const { key, raw } of snapshot) {
            if ((localStorage.getItem(key) ?? '[]') === raw) localStorage.removeItem(key);
        }
    });
    return true;
}
