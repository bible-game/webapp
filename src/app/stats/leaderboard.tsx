"use client"

import React from "react";
import { Leader } from "@/core/model/user/leader";

interface Props {
    leaders: Leader[]
}

export default function Leaderboard(props: Readonly<Props>) {
    return <div className="w-[80vw] sm:w-[48rem] mt-4">
        <div
            className="relative border border-yellow-500/50 bg-yellow-900/30 backdrop-blur-md rounded-md p-4 sm:p-5 shadow-lg text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-yellow-200">
                    <h2 className="text-lg font-medium text-yellow-300">Leaderboard</h2>
                    <ol className="list-decimal list-inside mt-2">
                        {props.leaders.toReversed().map((entry: Leader) => (
                            <li key={entry.id} className="text-sm text-yellow-400 leading-tight font-light">
                                {entry.firstname} {entry.lastname}, {entry.gameStars + entry.reviewStars} ⭐
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    </div>
}
