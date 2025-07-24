"use client"

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPrompt(props: any) {

    const [dismissed, setDismissed] = useState(false);

    if (!props.authenticated && !dismissed)
        return <div className="w-[80vw] sm:w-[46rem] mt-4">
            <div
                className="relative border border-purple-500/50 bg-purple-900/30 backdrop-blur-md rounded-md p-4 sm:p-5 shadow-lg text-white">
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute text-purple-400 hover:text-purple-300 text-md font-bold right-4 -translate-y-1"
                    aria-label="Close">×</button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-purple-200">
                        <p className="text-sm text-purple-400 leading-tight font-light">
                            <Link href="/account/log-in" className="underline font-medium">Log in</Link> to keep your data safe and compete on the leaderboard!
                        </p>
                    </div>
                </div>
            </div>
        </div>
}
