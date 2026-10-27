"use server"

/** Parses a hidden form field holding a JSON array of browser state */
function parseState(value: FormDataEntryValue | null): any[] {
    try {
        const parsed = JSON.parse(typeof value === 'string' && value ? value : '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * Merges the games, reads and reviews recorded on this device while logged out into the user's account.
 * Best-effort: a failed sync never stops the log-in, and the browser keeps its copy to try again next time.
 */
export async function syncState(token: string, formData: FormData): Promise<void> {
    const body = {
        games: parseState(formData.get("games")),
        reads: parseState(formData.get("reads")),
        reviews: parseState(formData.get("reviews"))
    };
    if (!body.games.length && !body.reads.length && !body.reviews.length) return;

    try {
        const response = await fetch(`${process.env.SVC_USER}/state/sync`, {
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok) console.error(`State sync failed: ${response.status} ${response.statusText}`);
    } catch (error: any) {
        console.error(`Error when syncing state: ${error.message}`);
    }
}
