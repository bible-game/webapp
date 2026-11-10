import { Suspense, type ReactNode } from "react";

/** The account layout supplies navigation; Clerk supplies the themed authentication card. */
export default function ClerkAccountScreen({ children }: { children: ReactNode }) {
    return (
        <main className="auth-page account-page">
            <div className="account-content">
            <Suspense fallback={<p role="status" className="account-description">Loading your account…</p>}>
                {children}
            </Suspense>
            </div>
        </main>
    );
}
