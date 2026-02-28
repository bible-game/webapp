"use server"


import { getUserId } from "@/core/util/auth-util";


export async function trackCompletion(uuid: string): Promise<void> {
    const userId = await getUserId();

    const body = userId !== null
        ? { userId: Number(userId) }
        : { uuid };

    await fetch(`${process.env.SVC_METRICS}/track/completion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}
