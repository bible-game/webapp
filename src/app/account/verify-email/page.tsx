import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { accountNext } from "@/core/auth/paths";
import ClerkAccountScreen from "@/core/component/clerk-account-screen";
import VerifyEmail from "@/core/component/account/verify-email";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const next = accountNext((await searchParams).next);
    if (!(await auth()).isAuthenticated) redirect('/account/log-in?next=' + encodeURIComponent(next));
    return <ClerkAccountScreen><VerifyEmail next={next}/></ClerkAccountScreen>;
}
