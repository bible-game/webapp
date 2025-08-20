"use server"

import Landing from "@/app/landing";
import getUserInfo, { UserInfo } from "@/core/action/user/get-user-info";
import isLoggedIn from "@/core/util/auth-util";
import {headers} from "next/headers";

export default async function Page() {
    const headersList = await headers();
    const device = headersList.get('x-device-type');

    let info: UserInfo | undefined;
    if (await isLoggedIn()) {
        info = await getUserInfo();
    }

    return <Landing info={info} device={device} />
}