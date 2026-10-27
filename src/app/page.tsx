"use server"

import Landing from "@/app/landing";
import getUserInfo, { UserInfo } from "@/core/action/user/get-user-info";
import isLoggedIn, { isKnownUser } from "@/core/util/auth-util";

/** The Bible's structure (testaments, divisions, books), for How it works' map; none if the passage service is down */
async function getBible(): Promise<any[] | undefined> {
    try {
        const response = await fetch(`${process.env.SVC_PASSAGE}/config/bible`, { method: "GET" });
        return response.ok ? (await response.json()).testaments : undefined;
    } catch {
        return undefined;
    }
}

export default async function Page() {
    let info: UserInfo | undefined;
    if (await isLoggedIn()) {
        info = await getUserInfo();
    }
    const known = !info && await isKnownUser();
    const bible = await getBible();

    return <Landing info={info} known={known} bible={bible}/>
}
