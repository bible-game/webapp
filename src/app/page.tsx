"use server"

import Landing from "@/app/landing";
import getUserInfo, { UserInfo } from "@/core/action/user/get-user-info";
import isLoggedIn, { isKnownUser } from "@/core/util/auth-util";
import getBible from "@/core/action/config/get-bible";

/** The Bible's testaments, for How it works' map; none if the passage service is down */
async function getTestaments(): Promise<any[] | undefined> {
    try {
        return (await getBible()).testaments;
    } catch {
        return undefined;
    }
}

export default async function Page() {
    const loggedIn = await isLoggedIn();
    const [info, bible]: [UserInfo | undefined, any[] | undefined] = await Promise.all([
        loggedIn ? getUserInfo() : undefined,
        getTestaments()
    ]);
    const known = !info && await isKnownUser();

    return <Landing info={info} known={known} bible={bible}/>
}
