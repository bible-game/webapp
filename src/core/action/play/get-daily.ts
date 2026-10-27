"use server"

import { Passage } from "@/core/model/play/passage";

/** The daily passage for a date (YYYY-MM-DD); none if the passage service can't give it, and the page fetches it instead */
export default async function getDaily(date: string): Promise<Passage | undefined> {
    try {
        const response = await fetch(`${process.env.SVC_PASSAGE}/daily/${date}`, { method: "GET" });
        return response.ok ? await response.json() : undefined;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}
