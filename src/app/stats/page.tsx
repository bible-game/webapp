"use server"

import { Toaster } from "react-hot-toast";
import React from "react";
import Menu from "@/app/menu";
import Background from "@/app/background";
import Metrics from "@/app/stats/metrics";
import Completion from "@/app/stats/completion";
import LoginPrompt from "@/app/stats/login-prompt";
import Leaderboard from "@/app/stats/leaderboard";

import { getReadState } from "@/core/action/state/get-state-read";
import { ReadState } from "@/core/model/state/read-state";
import { GameState } from "@/core/model/state/game-state";
import { getGameState } from "@/core/action/state/get-state-game";
import isLoggedIn, { getUserId } from "@/core/util/auth-util";
import getUserInfo, { UserInfo } from "@/core/action/user/get-user-info";
import getLeaders from "@/core/action/user/get-leaders";
import { getReviewState } from "@/core/action/state/get-state-review";
import { ReviewState } from "@/core/model/state/review-state";
import getRank from "@/core/action/user/get-rank";

async function get(url: string): Promise<any> {
    const response = await fetch(url, {method: "GET"});
    return await response.json();
}

/**
 * Statistics Page
 * @since 12th April 2025
 */
export default async function Stats() {

    let displayName: string | undefined;
    const bible = await get(`${process.env.SVC_PASSAGE}/config/bible`);
    const leaders = await getLeaders();

    let gameState: Map<number,GameState> | undefined;
    let readState: Map<string,ReadState> | undefined;
    let reviewState: Map<string,ReviewState> | undefined;
    let info: UserInfo | undefined;
    let rank: { rank?: number, totalPlayers?: number } = {};
    if (await isLoggedIn()) {
        gameState = await getGameState();
        readState = await getReadState();
        reviewState = await getReviewState();

        info = await getUserInfo();
        displayName = `${info?.firstname} ${info?.lastname}`;
        rank = await getRank(await getUserId() ?? '1'); // fixme
    }

    return (
        <>
            <Background/>
            <main className="w-full flex justify-center">
                <div>
                    <Menu isStats={true} info={info} />
                    <section className="mx-4 sm:mx-0 w-full">
                        <div className="flex gap-12 items-center">
                            <div className="flex flex-col">
                                <div className="flex gap-2">
                                    {displayName && <h1 className="text-[1.5rem] mx-0">{`${displayName}'s`}</h1>}
                                    <h1 className="text-[1.5rem] mx-0">Statistics</h1>
                                </div>
                                {rank.rank && rank.totalPlayers && (
                                    <p className="text-xs text-white-500 opacity-60 font-extralight -translate-y-3">
                                        {`${rank.rank} of ${rank.totalPlayers}`}
                                    </p>
                                )}
                            </div>
                        </div>
                        {!info && <LoginPrompt/>}
                        <Leaderboard leaders={leaders}/>
                        <Metrics gameState={gameState} readState={readState} reviewState={reviewState} bible={bible}/>
                        <Completion bible={bible}/>
                    </section>
                </div>
            </main>
            <Toaster position="bottom-right"/>
        </>
    );
}