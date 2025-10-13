"use server"

import { Leader } from "@/core/model/user/leader";

export default async function getLeaders(limit: number = 10): Promise<Leader[]> {
    try {
        const response = await fetch(`${process.env.SVC_USER}/leader/top?limit=${limit}`);
        return await response.json();
    } catch (e) {
        console.error(e);
    }
    return [];
}
