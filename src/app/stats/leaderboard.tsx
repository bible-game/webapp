"use client"

import React from "react";
import { LeaderboardEntry } from "@/core/action/user/get-leaderboard";

interface Props {
    leaderboard: LeaderboardEntry[];
}

export default function Leaderboard(props: Props) {
    return <div className="w-[80vw] sm:w-[46rem] mt-4">
        <div
            className="relative border border-yellow-500/50 bg-yellow-900/30 backdrop-blur-md rounded-md p-4 sm:p-5 shadow-lg text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-yellow-200">
                    <h2 className="text-lg font-medium text-yellow-300">Leaderboard</h2>
                    <ol className="list-decimal list-inside mt-2">
                        {props.leaderboard.map((entry, index) => (
                            <li key={index} className="text-sm text-yellow-400 leading-tight font-light">
                                {entry.firstname} {entry.lastname} - {entry.stars} stars
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    </div>
}
