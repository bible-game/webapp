"use server"

import { Toaster } from "react-hot-toast";
import React from "react";
import Menu from "@/app/menu";
import StatsContent from "@/app/stats/stats-content";
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
import { cookies } from "next/headers";

async function get(url: string): Promise<any> {
    const response = await fetch(url, {method: "GET"});
    return await response.json();
}

const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

/**
 * Statistics Page
 * @since 12th April 2025
 */
export default async function Stats() {
    let _ = cookies();

    let displayName: string | undefined;
    const bible = await get(`${process.env.SVC_PASSAGE}/config/bible`);
    const leaders = await getLeaders();

    let gameState: Map<number,GameState> | undefined;
    let readState: Map<string,ReadState> | undefined;
    let reviewState: Map<string,ReviewState> | undefined;
    let info: UserInfo | undefined;
    let rank: { rank?: number, totalPlayers?: number } = {};
    let userId: string | undefined;
    if (await isLoggedIn()) {
        gameState = await getGameState();
        readState = await getReadState();
        reviewState = await getReviewState();

        info = await getUserInfo();
        displayName = `${info?.firstname} ${info?.lastname}`;
        userId = await getUserId() ?? undefined;
        rank = await getRank(userId ?? '1'); // fixme
    }

    return (
        <>
            <Menu info={info}/>
            <main className="app-page">
                <header className="page-heading">
                    <h1>Statistics</h1>
                    {displayName && <p>{displayName}</p>}
                    {rank.rank && rank.totalPlayers && (
                        <p className="text-[13px] text-ui-muted">
                            <span>{rank.rank}</span><sup>{getOrdinalSuffix(rank.rank)}</sup><span> of {rank.totalPlayers}</span>
                        </p>
                    )}
                </header>
                {!info && <LoginPrompt/>}
                <StatsContent bible={bible} gameState={gameState} readState={readState} reviewState={reviewState}>
                    <Leaderboard leaders={leaders} currentUserId={userId}/>
                </StatsContent>
            </main>
            <Toaster position="bottom-right"/>
        </>
    );
}
