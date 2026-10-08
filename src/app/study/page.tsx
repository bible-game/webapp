'use server';

import Menu from "@/app/menu";
import getUserInfo, {UserInfo} from "@/core/action/user/get-user-info";
import isLoggedIn from "@/core/util/auth-util";
import StudyPicker from "@/app/study/study-picker";
import StudyHeader from "@/app/study/study-header";
import { cookies } from "next/headers";

export default async function Study() {
    let _ = cookies();

    let info: UserInfo | undefined;
    if (await isLoggedIn()) {
        info = await getUserInfo();
    }

    return (
        <div className="min-h-dvh">
            <Menu info={info}/>
            <main className="app-page">
                <StudyHeader/>
                <StudyPicker/>
            </main>
        </div>
    );
}
