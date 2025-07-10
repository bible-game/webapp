"use server"

import { Toaster } from "react-hot-toast";
import React from "react";
import Navigation from "@/app/navigation";
import Background from "@/app/background";
import Image from 'next/image'
import Metrics from "@/app/stats/metrics";
import Completion from "@/app/stats/completion";

/**
 * Statistics Page
 * @since 12th April 2025
 */
export default async function Stats() {

    return (
        <>
            <Background/>
            <Navigation play={true} read={true}/>
            <main className="flex sm:top-0 top-[14rem]">
                <Toaster position="bottom-right"/>
                <section>
                    <h1 className="text-[1.5rem]">Statistics</h1>
                    <Metrics/>
                    <section className="flex justify-center sm:w-[46rem] w-full">
                        <a href="https://discord.gg/6ZJYbQcph5" target="_blank" className="flex gap-2 items-center">
                            <Image src="/discord.png" alt="discord" width={160} height={0}/>
                        </a>
                    </section>
                    <Completion/>
                </section>
            </main>
        </>
    );
}