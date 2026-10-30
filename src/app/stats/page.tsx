"use server"

import { Toaster } from "react-hot-toast";
import React from "react";
import Menu from "@/app/menu";
import StatsContent from "@/app/stats/stats-content";
import Link from "next/link";
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
            {/* Top right, where the star count usually sits: the player's place, or for a visitor the call to log in */}
            <Menu info={info} aside={!info ? (
                <Link href="/account/log-in" aria-label="Log in to save your progress"
                      className="flex h-9 items-center rounded-lg border border-ui-line bg-ui-surface px-3 text-[13px] font-semibold text-ui-text hover:bg-ui-raised">
                    Log in
                </Link>
            ) : rank.rank && rank.totalPlayers ? (
                <span className="px-2 text-[13px] font-semibold tabular-nums">
                    {rank.rank}<sup>{getOrdinalSuffix(rank.rank)}</sup><span className="font-normal text-ui-muted"> of {rank.totalPlayers}</span>
                </span>
            ) : null}>
                {displayName && <span className="truncate text-[17px] font-semibold">{displayName}</span>}
            </Menu>
            <main className="app-page">
                <h1 className="sr-only">Statistics</h1>
                <StatsContent bible={bible} gameState={gameState} readState={readState} reviewState={reviewState}>
                    <Leaderboard leaders={leaders} currentUserId={userId}/>
                </StatsContent>
            </main>
            <Toaster position="bottom-right"/>
        </>
    );
}
