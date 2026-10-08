"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import { Leader } from "@/core/model/user/leader";

interface Props {
    leaders: Leader[];
    currentUserId?: string;
}
const PAGE_SIZE = 5;

export default function Leaderboard({ leaders, currentUserId }: Readonly<Props>) {
    const [page, setPage] = useState(0);
    const sorted = leaders.toReversed();
    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const items = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    return <section className="w-full py-6">
        <h2 className="mb-4 text-[16px] font-semibold">Leaderboard</h2>
        {!items.length ? <p className="text-[14px] text-ui-muted">No scores yet.</p> :
            <table className="w-full text-left text-[14px]">
                <thead className="text-[12px] text-ui-muted">
                    <tr className="border-b border-ui-line"><th scope="col" className="w-12 pb-3 font-medium">Rank</th><th scope="col" className="pb-3 font-medium">Player</th><th scope="col" className="pb-3 text-right font-medium">Stars</th></tr>
                </thead>
                <tbody>{items.map((entry, index) => <tr key={entry.id} className={`border-b border-ui-line ${String(entry.id) === currentUserId ? "bg-ui-surface" : ""}`}>
                    <td className="py-3 text-ui-muted tabular-nums">{page * PAGE_SIZE + index + 1}</td>
                    <th scope="row" className="break-words py-3 pr-3 font-medium">{entry.firstname} {entry.lastname}</th>
                    <td className="whitespace-nowrap py-3 text-right tabular-nums">{entry.gameStars + entry.reviewStars}<StarIcon className="ml-1.5 inline size-3.5 text-play-gold" fill="currentColor"/></td>
                </tr>)}</tbody>
            </table>}
        {totalPages > 1 && <div className="mt-3 flex items-center justify-end gap-3">
            <button type="button" className="ui-icon" aria-label="Previous leaderboard page" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeftIcon className="size-5"/></button>
            <span className="text-[13px] text-ui-muted tabular-nums">{page + 1} / {totalPages}</span>
            <button type="button" className="ui-icon" aria-label="Next leaderboard page" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRightIcon className="size-5"/></button>
        </div>}
    </section>;
}
