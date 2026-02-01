"use client"

import React, { useEffect, useState } from "react";
import { CompletionUtil } from "@/core/util/completion-util";

interface Props {
    gameState?: any;
    readState?: any;
    reviewState?: any;
    bible: any;
    completionPercentage: string;
}

const Metrics = (props: Readonly<Props>) => {
    const [metrics, setMetrics] = useState({ stars: 0, games: 0, streak: 0 });

    useEffect(() => {
        setMetrics({
            stars: CompletionUtil.calcStars(),
            games: CompletionUtil.calcGames(),
            streak: CompletionUtil.calcStreak(),
        });
    }, []);

    const cards = [
        {
            label: "Stars",
            value: metrics.stars,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24" strokeWidth="1.5" stroke="gold" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
            ),
            border: "border-yellow-500/40",
            bg: "bg-yellow-900/20",
        },
        {
            label: "Games",
            value: metrics.games,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-blue-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
                </svg>
            ),
            border: "border-blue-500/40",
            bg: "bg-blue-900/20",
        },
        {
            label: "Day Streak",
            value: metrics.streak,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-orange-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
            ),
            border: "border-orange-500/40",
            bg: "bg-orange-900/20",
        },
        {
            label: "Completion",
            value: `${props.completionPercentage}%`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-emerald-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            ),
            border: "border-emerald-500/40",
            bg: "bg-emerald-900/20",
        },
    ];

    return (
        <section className="sm:w-[48rem] w-[80vw] my-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className={`relative border ${card.border} ${card.bg} backdrop-blur-md rounded-md p-4 shadow-lg text-white`}
                    >
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            {card.icon}
                            <span className="text-xs font-light tracking-wide uppercase">{card.label}</span>
                        </div>
                        <p className="text-2xl font-semibold">{card.value}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Metrics;
