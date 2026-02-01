"use client"

import React, { useState } from "react";
import { Leader } from "@/core/model/user/leader";

interface Props {
    leaders: Leader[];
    currentUserId?: string;
}

const PAGE_SIZE = 5;

export default function Leaderboard(props: Readonly<Props>) {
    const [page, setPage] = useState(0);

    const getOrdinalSuffix = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    const sorted = props.leaders.toReversed();
    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const pageItems = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="w-[80vw] sm:w-[48rem] mt-4">
            <div className="relative border border-yellow-500/50 bg-yellow-900/30 backdrop-blur-md rounded-md p-4 sm:p-5 shadow-lg text-white">
                <div className="text-yellow-200 w-full">
                    <h2 className="text-lg font-medium text-yellow-300">Leaderboard</h2>
                    <ul className="list-inside mt-2">
                        {pageItems.map((entry: Leader, index: number) => {
                            const rank = page * PAGE_SIZE + index + 1;
                            const ordinal = getOrdinalSuffix(rank);
                            const isCurrentUser = props.currentUserId && String(entry.id) === props.currentUserId;
                            return (
                                <li
                                    key={entry.id}
                                    className={`text-sm leading-tight font-light p-2 rounded-md ${
                                        isCurrentUser
                                            ? 'bg-yellow-500/20 border border-yellow-400/30 text-yellow-200'
                                            : index % 2 === 0
                                                ? 'bg-yellow-900/20 text-yellow-400'
                                                : 'text-yellow-400'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <span className="font-semibold text-yellow-200 w-12 inline-block">
                                            {rank}{ordinal}
                                        </span>
                                        <div className="flex justify-between w-full items-center">
                                            <span className="ml-2">
                                                {entry.firstname} {entry.lastname}
                                                {isCurrentUser && <span className="text-[10px] ml-1.5 text-yellow-300/60 uppercase tracking-wide">(you)</span>}
                                            </span>
                                            <span>{entry.gameStars + entry.reviewStars} &#11088;</span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-yellow-500/20">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="text-xs text-yellow-300 disabled:text-yellow-300/20 hover:text-yellow-100 transition-colors px-2 py-1"
                            >
                                &#8249; Prev
                            </button>
                            <span className="text-[10px] text-yellow-300/50 tabular-nums">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="text-xs text-yellow-300 disabled:text-yellow-300/20 hover:text-yellow-100 transition-colors px-2 py-1"
                            >
                                Next &#8250;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
