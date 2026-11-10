import { redirect } from "next/navigation";
import { accountNext } from "@/core/auth/paths";

/** Old recovery links enter Clerk's recovery flow from the login screen. */
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    redirect('/account/log-in?next=' + encodeURIComponent(accountNext((await searchParams).next)));
}
