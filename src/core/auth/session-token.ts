import "server-only";
import { auth } from "@clerk/nextjs/server";

/** Shared server implementation; keeping this outside Server Actions avoids an account-info import cycle. */
export async function sessionToken(): Promise<string | null> {
    const session = await auth();
    return session.isAuthenticated ? session.getToken() : null;
}
