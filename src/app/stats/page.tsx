"use server"

import { Toaster } from "react-hot-toast";
import React from "react";
import Navigation from "@/app/navigation";
import Background from "@/app/background";
import Image from 'next/image'
import Metrics from "@/app/stats/metrics";
import Completion from "@/app/stats/completion";
import LoginPrompt from "@/app/stats/login-prompt";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/**
 * Statistics Page
 * @since 12th April 2025
 */
export default async function Stats() {

    let firstname: string | undefined = undefined;
    const cookieStore = await cookies();

    try {
        const token = cookieStore.get('token');
        if (token) {
            const { payload } = await jwtVerify(token.value, new TextEncoder().encode(process.env.SIGNING_SECRET))
            firstname = payload.sub as string; // todo :: display name, Giles Denham...
        }
    } catch (e) {
        console.error(e)
    }

    return (
        <>
            <Background/>
            <main className="flex top-12 sm:mt-8 m-0">
                <Toaster position="bottom-right"/>
                <section>
                    <div className="flex gap-12 items-center">
                        <div className="flex gap-2">
                            <h1 className="text-[1.5rem] mx-0">Statistics</h1>
                            {firstname && <h1 className="text-[1.5rem] mx-0">{`for ${firstname}`}</h1>}
                        </div>
                        <a href="https://discord.gg/6ZJYbQcph5" target="_blank" className="flex gap-2 items-center translate-y-2.5">
                            <Image src="/discord.png" alt="discord" width={100} height={0}/>
                        </a>
                    </div>
                    <LoginPrompt authenticated={!!cookieStore.get('token')}/>
                    <Metrics/>
                    <Completion/>
                </section>
            </main>
            <Navigation play={true} read={true}/>
        </>
    );
}