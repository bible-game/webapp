"use server"

import { DailyPlayerStats } from "@/core/model/metrics/daily-player-stats";

export async function getDailyStats(): Promise<DailyPlayerStats> {
    const response = await fetch(`${process.env.SVC_METRICS}/stats/daily-players`);
    return await response.json();
}
