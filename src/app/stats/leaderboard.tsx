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
            <div className="relative border border-white/[0.15] bg-gradient-to-br from-[#050730]/80 to-[#040127]/80 backdrop-blur-md rounded-lg p-4 sm:p-5 shadow-lg text-white">
                <h2 className="text-sm font-medium text-white/70 mb-3">Leaderboard</h2>
                <ul className="space-y-0.5">
                    {pageItems.map((entry: Leader, index: number) => {
                        const rank = page * PAGE_SIZE + index + 1;
                        const ordinal = getOrdinalSuffix(rank);
                        const isCurrentUser = props.currentUserId && String(entry.id) === props.currentUserId;
                        return (
                            <li
                                key={entry.id}
                                className={`text-sm leading-tight font-light px-3 py-2 rounded-md ${
                                    isCurrentUser
                                        ? 'bg-white/10 border border-white/20'
                                        : index % 2 === 0
                                            ? 'bg-white/[0.03]'
                                            : ''
                                }`}
                            >
                                <div className="flex items-center">
                                    <span className="font-semibold text-white/60 w-12 inline-block tabular-nums">
                                        {rank}{ordinal}
                                    </span>
                                    <div className="flex justify-between w-full items-center">
                                        <span className="text-white/80">
                                            {entry.firstname} {entry.lastname}
                                        </span>
                                        <span className="text-white/60 tabular-nums">
                                            {entry.gameStars + entry.reviewStars}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24" strokeWidth="1.5" stroke="gold" className="size-3.5 inline ml-1 -translate-y-[1px]">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-white/10">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="text-xs text-white/50 disabled:text-white/15 hover:text-white/80 transition-colors px-2 py-1"
                        >
                            &#8249; Prev
                        </button>
                        <span className="text-[10px] text-white/30 tabular-nums">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="text-xs text-white/50 disabled:text-white/15 hover:text-white/80 transition-colors px-2 py-1"
                        >
                            Next &#8250;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
