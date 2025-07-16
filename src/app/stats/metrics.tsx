"use client"

import React, { useEffect, useState } from "react";
import { CompletionService } from "@/core/service/state/completion-service";

const Metrics = () => {

    const [stars, setStars] = useState(0);
    const [games, setGames] = useState(0);
    const [streak, setStreak] = useState(0);
    const [complete, setComplete] = useState("");

    useEffect(() => {
        setStars(CompletionService.calcStars);
        setGames(CompletionService.calcGames);
        setStreak(CompletionService.calcStreak);
        setComplete(CompletionService.calcCompletion);
    }, []);

    return <section className="sm:w-[46rem] w-[80vw]">
        <div className="flex my-8 justify-start gap-12 items-center flex-wrap">
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

}

export default Metrics;