"use client"

import { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import Navigation from "@/app/navigation";
import Background from "@/app/background";
import Cell from "@/app/stats/cell";
import { GameStatesService } from "@/core/service/game-states-service";
import { CompletionService } from "@/core/service/completion-service";

/**
 * Statistics Page
 * @since 12th April 2025
 */
export default function Stats() {

    const [stars, setStars] = useState(0);
    const [games, setGames] = useState(0);
    const [streak, setStreak] = useState(0);
    const [completion, setCompletion] = useState([] as any[]);
    const [complete, setComplete] = useState("");

    useEffect(() => {
        setStars(CompletionService.calcStars);
        setGames(CompletionService.calcGames);
        setStreak(CompletionService.calcStreak);
        setCompletion(GameStatesService.getCompletion);
        setComplete(CompletionService.calcCompletion);
    }, []);

    function pretty(text: string): any {
        const parts = text.split(/\d/);

        if (parts.length == 1)
            return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();

        else
            return `${text[0]} ${pretty(parts[1])}`;
    }

    return (
        <>
            <Background/>
            <Navigation play={true} read={true}/>
            <main className="flex items-center">
                <Toaster position="bottom-right"/>
                <section>
                    <section>
                        <div className="flex my-8 justify-start gap-12 items-center">
                            <div className="flex items-center">
                                <p className="text-[1.5rem]">{stars}</p>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24"
                                     strokeWidth="1.5"
                                     stroke="gold" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                                </svg>
                            </div>
                            <div><p className="text-[1.5rem]">{games}<span
                                className="text-gray-400 text-[1rem] ml-1">games</span></p></div>
                            <div><p className="text-[1.5rem]">{streak}<span
                                className="text-gray-400 text-[1rem] ml-1">days</span></p></div>
                            <div><p className="text-[1.5rem]">{complete}<span
                                className="text-gray-400 text-[1rem]">%</span></p></div>
                        </div>
                    </section>
                    <section className="flex flex-wrap">
                        {completion.map((c: any) => c.chapter.map((chapter: any, index = 0) =>
                            <Cell key={c.book + index} label={`${pretty(c.book)} ${++index}`} chapter={chapter}/>))}
                    </section>
                </section>
            </main>
        </>
    );
}