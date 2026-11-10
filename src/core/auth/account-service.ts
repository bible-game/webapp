import "server-only";
import { cache } from "react";
import { sessionToken } from "@/core/auth/session-token";

export interface AccountInfo {
    id: number;
    firstname: string;
    lastname: string;
    profileCompleted?: boolean;
}

export type AccountStatus = { status: "ready"; info: AccountInfo }
    | { status: "signed-out" | "verify-email" | "migration-required" | "unavailable" };

/** Request-scoped only: never share cached account data between requests or users. */
export const accountStatus = cache(async (): Promise<AccountStatus> => {
    const token = await sessionToken();
    if (!token) return { status: "signed-out" };
    try {
        const response = await fetch(`${process.env.SVC_USER}/info`, {
            headers: { authorization: `Bearer ${token}` }, cache: "no-store",
        });
        if (response.status === 401) return { status: "signed-out" };
        if (response.status === 403) return { status: "verify-email" };
        if (response.status === 409) return { status: "migration-required" };
        if (!response.ok) return { status: "unavailable" };
        const info = await response.json();
        if (!Number.isSafeInteger(info.id) || typeof info.firstname !== "string" || typeof info.lastname !== "string") return { status: "unavailable" };
        return { status: "ready", info };
    } catch {
        return { status: "unavailable" };
    }
});
