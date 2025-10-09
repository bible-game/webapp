"use server"

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

export async function getCookie(name: string): Promise<RequestCookie | undefined> {
    const cookieStore = await cookies()
    return cookieStore.get(name)
}

export async function setCookie(name: string, value: string, httpOnly = true) {
    const cookieStore = await cookies()
    cookieStore.set(name, value, { httpOnly: httpOnly })
}
