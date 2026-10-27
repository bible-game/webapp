"use server"

import { getUserId } from "@/core/util/auth-util";
import getRank from "@/core/action/user/get-rank";

/** The logged-in user's place on the leaderboard, e.g. { rank: 1, totalPlayers: 342 } (empty when logged out) */
export default async function getMyRank(): Promise<{ rank?: number, totalPlayers?: number }> {
    const userId = await getUserId();
    return userId ? getRank(userId) : {};
}
