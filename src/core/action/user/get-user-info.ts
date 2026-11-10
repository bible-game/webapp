"use server";

import { accountStatus, type AccountInfo } from "@/core/auth/account-service";

export type UserInfo = AccountInfo;

export default async function getUserInfo(): Promise<UserInfo | undefined> {
    const result = await accountStatus();
    return result.status === "ready" ? result.info : undefined;
}
