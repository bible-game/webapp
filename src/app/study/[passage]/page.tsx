"use server"

import React from "react";
import isLoggedIn from "@/core/util/auth-util";
import { ReviewState } from "@/core/model/state/review-state";
import { getReviewState } from "@/core/action/state/get-state-review";
import StudyContent from "@/app/study/[passage]/study-content";
import getUserInfo, {UserInfo} from "@/core/action/user/get-user-info";

/**
 * Study Page
 * @since 10th July 2025
 */
export default async function Study({ params }: { params: Promise<{ passage: string }> }) {
    const { passage } = await params;

    let info: UserInfo | undefined;
    let state: Map<string,ReviewState> | undefined;
    if (await isLoggedIn()) {
        info = await getUserInfo();
        state = await getReviewState();
    }

    return <StudyContent passage={passage} state={state} info={info}/>;
}
