import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { accountNext, continueTo } from "@/core/auth/paths";
import { accountStatus } from "@/core/auth/account-service";
import ClerkAccountScreen from "@/core/component/clerk-account-screen";
import ProfileForm from "@/core/component/account/profile-form";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const next = accountNext((await searchParams).next);
    const session = await auth();
    if (!session.isAuthenticated) redirect('/account/log-in?next=' + encodeURIComponent(next));
    const result = await accountStatus();
    if (result.status !== 'ready') redirect(continueTo(next));
    if (result.info.profileCompleted) redirect(next);
    return <ClerkAccountScreen><ProfileForm owner={session.userId} next={next}
        firstname={result.info.firstname} lastname={result.info.lastname}/></ClerkAccountScreen>;
}
