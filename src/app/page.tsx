"use server"

import Landing from "@/app/landing";
import getUserInfo, { UserInfo } from "@/core/action/user/get-user-info";
import isLoggedIn from "@/core/util/auth-util";

export default async function Page() {

    let info: UserInfo | undefined;
    if (await isLoggedIn()) {
        info = await getUserInfo();
    }

    return <Landing info={info}/>
}