"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { AccountError, AccountHeading } from "@/core/component/account/account-presentation";
import { useEffect, useState } from "react";
import { prepareAccount } from "@/core/action/account/prepare-account";
import { syncLocalState } from "@/core/util/state-sync";

export default function ContinueAccount({ next }: { next: string }) {
    const { userId } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        setError('');
        async function join() {
            const account = await prepareAccount(userId!);
            if (cancelled) return;
            const query = `?next=${encodeURIComponent(next)}`;
            if (account.status === 'verify-email') { router.replace('/account/verify-email' + query); return; }
            if (account.status === 'signed-out') {
                setError('We couldn’t confirm your sign-in. Please try again, or sign out and sign in again.');
                return;
            }
            if (account.status !== 'ready') {
                setError(account.status === 'migration-required'
                    ? 'Your existing account needs to be connected before you can continue. Please contact support.'
                    : 'We couldn’t connect to your account. Your progress is still saved on this device.');
                return;
            }
            const result = await syncLocalState();
            if (cancelled) return;
            if (result !== 'empty' && result !== 'synced') {
                setError('We couldn’t save your progress to your account yet. It is still saved on this device. Please try again.');
                return;
            }
            router.replace(account.info.profileCompleted ? next : '/account/profile' + query);
            router.refresh();
        }
        join().catch(() => { if (!cancelled) setError('We couldn’t connect just now. Your progress is still saved on this device.'); });
        return () => { cancelled = true; };
    }, [userId, next, router, attempt]);

    return <AccountConnectionState error={error} onRetry={() => setAttempt(value => value + 1)}
        onSignOut={() => void signOut({ redirectUrl: '/account/log-in?next=' + encodeURIComponent(next) })}/>;
}

export function AccountConnectionState({ error, onRetry, onSignOut }: { error?: string; onRetry: () => void; onSignOut: () => void }) {
    return <div className="account-stack">
        <AccountHeading title={error ? 'Your progress is safe' : 'Getting your account ready'}>
            {error ? 'Your progress is still saved on this device.' : 'Connecting your account and saving your progress…'}
        </AccountHeading>
        {error ? <>
            <AccountError>{error}</AccountError>
            <div className="account-actions">
                <button className="ui-button ui-primary account-primary" onClick={onRetry}>Try again</button>
                <Link className="ui-button" href="/play/today">Keep playing on this device</Link>
                <button className="account-text-action" onClick={onSignOut}>Sign out and sign in again</button>
            </div>
        </> : <div role="status" aria-live="polite" className="flex items-center gap-3 text-sm text-ui-muted">
            <LoaderCircle aria-hidden className="size-5 motion-safe:animate-spin"/>Saving your progress
        </div>}
    </div>;
}
