"use server"

export interface LeaderboardEntry {
    id: number,
    firstname: string;
    lastname: string;
    stars: number;
}

export default async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
        const response = await fetch(`${process.env.SVC_USER}/leader/top`);
        return await response.json();
    } catch (e) {
        console.error(e);
    }
    return [];
}
