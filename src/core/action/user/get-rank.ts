"use server"

export default async function getRank(userId: string): Promise<{ rank?: number, totalPlayers?: number }> {
    try {
        const response = await fetch(`${process.env.SVC_USER}/leader/rank?userId=${userId}`);
        return await response.json();
    } catch (e) {
        console.error(e);
    }
    return {};
}
