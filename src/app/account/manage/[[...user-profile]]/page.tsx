import { Suspense } from "react";
import { UserProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { clerkProfileAppearance } from "@/core/style/clerk-appearance";

/** Clerk owns profile editing, verification, reauthentication and deletion confirmation. */
export default async function Page() {
    if (!(await auth()).isAuthenticated) redirect('/account/log-in?next=%2Faccount%2Fmanage');
    return <main className="auth-page account-page">
        <div className="account-management">
            <h1 className="account-title mb-2">Manage account</h1>
            <p className="account-description mb-6">Update your profile and security settings.</p>
            <Suspense fallback={<p role="status" className="account-description">Loading your account…</p>}>
                <UserProfile routing="path" path="/account/manage" appearance={clerkProfileAppearance}/>
            </Suspense>
            <Link href="/play/today" className="account-text-action mt-6 inline-flex min-h-11 items-center">Back to the game</Link>
        </div>
    </main>;
}
