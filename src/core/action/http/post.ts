"use server"

import { getToken } from "@/core/util/auth-util";

export async function post(url: string, body: any): Promise<any> {
    const headers = { authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json'};
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body)});

    return response.json();
}