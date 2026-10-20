"use server"

import { getToken } from "@/core/util/auth-util";

export interface UserInfo {
    id: number,
    firstname: string;
    lastname: string;
}

export default async function getUserInfo(): Promise<UserInfo | undefined> {
    try {
        const headers = { authorization: `Bearer ${await getToken()}` };
        const response = await fetch(`${process.env.SVC_USER}/info`, { headers });
        // A 401 (e.g. after a password reset) means no user, which pages show as logged out
        if (response.ok) return await response.json();
    } catch (e) {
        console.error(e);
    }
    return undefined;
}
