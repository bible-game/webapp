'use server';

import Menu from "@/app/menu";
import getUserInfo, {UserInfo} from "@/core/action/user/get-user-info";
import isLoggedIn from "@/core/util/auth-util";
import StudyHome from "@/app/study/study-home";
import { getReviewState } from "@/core/action/state/get-state-review";
import { ReviewState } from "@/core/model/state/review-state";
import { cookies } from "next/headers";

export default async function Study() {
    let _ = cookies();

    let info: UserInfo | undefined;
    let state: Map<string, ReviewState> | undefined;
    if (await isLoggedIn()) {
        info = await getUserInfo();
        state = await getReviewState();
    }

    return (
        <div className="min-h-dvh">
            <Menu info={info}/>
            <main className="app-page">
                <StudyHome state={state}/>
            </main>
        </div>
    );
}
