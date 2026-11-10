import { SignIn, SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { accountNext, continueTo } from "@/core/auth/paths";

export type AccountSearch = Promise<{ next?: string; redirect_url?: string }>;

export default async function AuthEntry({ kind, searchParams }: { kind: "log-in" | "sign-up"; searchParams: AccountSearch }) {
    const search = await searchParams;
    const next = accountNext(search.next ?? search.redirect_url);
    const destination = continueTo(next);
    if ((await auth()).isAuthenticated) redirect(destination);
    const suffix = `?next=${encodeURIComponent(next)}`;
    return kind === "log-in"
        ? <SignIn routing="path" path="/account/log-in" signUpUrl={`/account/sign-up${suffix}`}
                  forceRedirectUrl={destination} signUpForceRedirectUrl={destination}/>
        : <SignUp routing="path" path="/account/sign-up" signInUrl={`/account/log-in${suffix}`}
                  forceRedirectUrl={destination} signInForceRedirectUrl={destination}/>;
}
