"use server"

import React from "react";
import isLoggedIn from "@/core/util/auth-util";
import { ReviewState } from "@/core/model/state/review-state";
import { getReviewState } from "@/core/action/state/get-state-review";
import Menu from "@/app/menu";
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

    return (
        <div className="bg-white absolute top-0 left-0 w-full h-full">
            <div className="flex justify-center">
                <main
                    className="bg-gradient-to-b from-white via-slate-50 to-indigo-50/30 w-full text-black relative overflow-auto pb-[12rem] flex justify-center">
                    <div className="w-full sm:w-min">
                        <Menu isPlay={false} info={info} dark={true}/>
                        <StudyContent passage={passage} state={state}/>
                    </div>
                </main>
            </div>
        </div>
    );
}