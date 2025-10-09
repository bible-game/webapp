"use server"

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getSecret, getToken } from "@/core/util/auth-util";
import { setCookie } from "@/core/action/auth/cookie";

export async function refreshTokens(): Promise<boolean> {

    const cookieStore = await cookies()
    const response = await fetch(`${process.env.SVC_USER}/auth/login/renew-token`, {
        headers: {
            Authorization: `Bearer ${cookieStore.get('refresh')!.value}`
        }
    })
    if (response.status == 200) {
        const tokens = await response.json() as { authToken: string, refreshToken: string }

        await setCookie('token', tokens.authToken)
        await setCookie('refresh', tokens.refreshToken)
        const token = await getToken()
        if (token) {
            const { payload } = await jwtVerify(token, await getSecret())
            return !!payload.sub
        }
    } else {
        const err = await response.json() as { error: string }
        console.error(`Token renewal failed with error: ${err.error}`)
    }
    return false
}
