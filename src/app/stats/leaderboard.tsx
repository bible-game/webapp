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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div className="text-yellow-200 w-full">
                    <h2 className="text-lg font-medium text-yellow-300">Leaderboard</h2>
                    <ul className="list-inside mt-2">
                        {props.leaders.toReversed().map((entry: Leader, index: number) => {
                            const rank = index + 1;
                            const getOrdinalSuffix = (n: number) => {
                                const s = ["th", "st", "nd", "rd"];
                                const v = n % 100;
                                return s[(v - 20) % 10] || s[v] || s[0];
                            };
                            const ordinal = getOrdinalSuffix(rank);
                            return (
                                <li key={entry.id}
                                    className={`text-sm text-yellow-400 leading-tight font-light p-2 rounded-md ${index % 2 === 0 ? 'bg-yellow-900/20' : ''}`}>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-yellow-200 w-16 inline-block">
                                            {rank}{ordinal}
                                        </span>
                                        <div className="flex justify-between w-full items-center">
                                            <span className="ml-2">{entry.firstname} {entry.lastname}</span>
                                            <span>{entry.gameStars + entry.reviewStars} ⭐</span>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    </div>
}
