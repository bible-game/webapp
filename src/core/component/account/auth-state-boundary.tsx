"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { StorageUtil } from "@/core/util/storage-util";
import { prepareAccountStorage } from "@/core/util/account-storage";
import { syncLocalState } from "@/core/util/state-sync";

export default function AuthStateBoundary({ children, serverUserId }: { children: ReactNode; serverUserId: string | null }) {
    const { isLoaded, userId } = useAuth();
    // A server-confirmed guest can play even when Clerk's browser script is slow or unavailable.
    const resolved = isLoaded || serverUserId === null;
    const owner = isLoaded ? userId ?? null : serverUserId;
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState<{ owner: string | null; transferred: boolean }>();
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!resolved) return;
        let cancelled = false;
        if (serverUserId !== owner) { router.refresh(); return; }
        setFailed(false);
        prepareAccountStorage(owner).then(transferred => {
            if (cancelled) return;
            StorageUtil.selectOwner(owner);
            setReady({ owner, transferred });
        }).catch(() => { if (!cancelled) setFailed(true); });
        return () => { cancelled = true; };
    }, [resolved, owner, serverUserId, router]);

    const active = resolved && serverUserId === owner && ready?.owner === owner;
    useEffect(() => {
        if (!active || !owner) return;
        const retry = () => {
            if (navigator.onLine && document.visibilityState !== 'hidden') {
                syncLocalState().then(result => { if (result === 'synced') router.refresh(); });
            }
        };
        retry();
        let debounce: ReturnType<typeof setTimeout>;
        const changed = () => { clearTimeout(debounce); debounce = setTimeout(retry, 150); };
        window.addEventListener(StorageUtil.CHANGED, changed);
        window.addEventListener('storage', changed);
        window.addEventListener('online', retry);
        window.addEventListener('pageshow', retry);
        document.addEventListener('visibilitychange', retry);
        const interval = window.setInterval(retry, 30_000);
        return () => {
            clearTimeout(debounce);
            window.removeEventListener(StorageUtil.CHANGED, changed);
            window.removeEventListener('storage', changed);
            window.removeEventListener('online', retry);
            window.removeEventListener('pageshow', retry);
            document.removeEventListener('visibilitychange', retry);
            window.clearInterval(interval);
        };
    }, [active, owner, pathname, router]);

    if (!active) return <main className="auth-page"><div role="status">{failed
        ? <>Your device storage is unavailable. Please enable it and <button className="underline" onClick={() => window.location.reload()}>try again</button>.</>
        : 'Loading your progress…'}</div></main>;
    return <div key={owner ?? 'guest'}>
        {!ready?.transferred && <p role="status" className="px-4 py-2 text-sm text-ui-muted">Your guest progress is still saved on this device. Try an up-to-date browser to transfer it safely.</p>}
        {children}
    </div>;
}
