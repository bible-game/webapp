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
import LogoutButton from "@/app/stats/logout-button";
import { getReadState } from "@/core/action/state/get-state-read";
import { ReadState } from "@/core/model/state/read-state";
import { GameState } from "@/core/model/state/game-state";
import { getGameState } from "@/core/action/state/get-state-game";
import isLoggedIn from "@/core/util/auth-util";

async function get(url: string): Promise<any> {
    const response = await fetch(url, {method: "GET"});
    return await response.json();
}

/**
 * Statistics Page
 * @since 12th April 2025
 */
export default async function Stats() {

    let firstname: string | undefined = undefined;
    const cookieStore = await cookies();

    const bible = await get(`${process.env.SVC_PASSAGE}/config/bible`);

    let gameState: Map<number,GameState> | undefined;
    let readState: Map<string,ReadState> | undefined;
    if (await isLoggedIn()) {
        gameState = await getGameState();
        readState = await getReadState();
    }

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
                        {firstname && <LogoutButton/>}
                        <a href="https://discord.gg/6ZJYbQcph5" target="_blank" className="flex gap-2 items-center translate-y-2.5">
                            <Image src="/discord.png" alt="discord" width={100} height={0}/>
                        </a>
                    </div>
                    {!firstname && <LoginPrompt/>}
                    <Metrics gameState={gameState} readState={readState}/>
                    {/*<Completion gameState={gameState} readState={readState} bible={bible}/>*/}
                </section>
            </main>
            <Navigation play={true} read={true}/>
        </>
    );
}