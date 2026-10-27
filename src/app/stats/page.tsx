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
import { Leader } from "@/core/model/user/leader";
import { getReviewState } from "@/core/action/state/get-state-review";
import { ReviewState } from "@/core/model/state/review-state";
import getRank from "@/core/action/user/get-rank";
import { cookies } from "next/headers";
import getBible from "@/core/action/config/get-bible";

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

    // The calls are independent, so they run together rather than one after another
    const loggedIn = await isLoggedIn();
    const userId: string | undefined = loggedIn ? await getUserId() ?? undefined : undefined; // read from the token, no request
    const [bible, leaders, gameState, readState, reviewState, info, rank]: [
        any,
        Leader[],
        Map<number,GameState> | undefined,
        Map<string,ReadState> | undefined,
        Map<string,ReviewState> | undefined,
        UserInfo | undefined,
        { rank?: number, totalPlayers?: number }
    ] = await Promise.all([
        getBible(),
        getLeaders(),
        loggedIn ? getGameState() : undefined,
        loggedIn ? getReadState() : undefined,
        loggedIn ? getReviewState() : undefined,
        loggedIn ? getUserInfo() : undefined,
        loggedIn ? getRank(userId ?? '1') : {} // fixme
    ]);
    const displayName = info ? `${info.firstname} ${info.lastname}` : undefined;

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
