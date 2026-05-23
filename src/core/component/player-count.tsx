"use client"

import React, { useEffect, useState } from "react";
import { getDailyStats } from "@/core/action/metrics/get-daily-stats";
import { DailyPlayerStats } from "@/core/model/metrics/daily-player-stats";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function PlayerCount() {
    const [stats, setStats] = useState<DailyPlayerStats | null>(null);

    const fetchStats = async () => {
        const data = await getDailyStats();
        setStats(data);
    };

    useEffect(() => {
        fetchStats().catch(error => {
            console.error("Failed to fetch player count:", error);
            setStats(null);
        });

        const interval = setInterval(() => {
            fetchStats().catch(error => {
                console.error("Failed to refresh player count:", error);
                // keep last known count — do not clear stats
            });
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    if (stats === null) {
        return null;
    }

    return <p>{stats.totalCount.toLocaleString()} people played today</p>;
}
