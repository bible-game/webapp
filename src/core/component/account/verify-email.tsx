"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@heroui/react";
import { KeyRound } from "lucide-react";
import { inputClassNames, submitButtonClassName, submitButtonStyle } from "@/core/model/form/form-styles";
import { AccountError, AccountHeading } from "@/core/component/account/account-presentation";

export function VerificationCodeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return <Input classNames={{ ...inputClassNames, input: `${inputClassNames.input} font-mono tracking-[0.14em] tabular-nums` }}
        label="Verification code" description="Enter the code from your email." variant="bordered" name="code"
        value={value} onValueChange={onChange} inputMode="numeric" autoComplete="one-time-code" isRequired maxLength={12}
        startContent={<KeyRound className="size-5 shrink-0 text-ui-faint"/>}/>;
}
import { continueTo } from "@/core/auth/paths";

export default function VerifyEmail({ next }: { next: string }) {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [sent, setSent] = useState(false);
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    async function send() {
        if (!user?.primaryEmailAddress) return;
        setBusy(true); setError('');
        try { await user.primaryEmailAddress.prepareVerification({ strategy: 'email_code' }); setSent(true); }
        catch { setError('We couldn’t send the code. Please try again.'); }
        finally { setBusy(false); }
    }
    async function verify(event: FormEvent) {
        event.preventDefault();
        if (!user?.primaryEmailAddress) return;
        setBusy(true); setError('');
        try {
            const email = await user.primaryEmailAddress.attemptVerification({ code });
            if (email.verification.status !== 'verified') { setError('Please check the code and try again.'); return; }
            await user.reload();
            router.replace(continueTo(next));
            router.refresh();
        } catch { setError('That code couldn’t be verified. Please check it or request a new one.'); }
        finally { setBusy(false); }
    }
    return <div className="account-stack">
        <AccountHeading title="Verify your email">Before opening your account, please verify {user?.primaryEmailAddress?.emailAddress ?? 'your email address'}.</AccountHeading>
        {user?.primaryEmailAddress?.verification.status === 'verified'
            ? <Link className="ui-button ui-primary account-primary" href={continueTo(next)}>Continue</Link>
            : <>
                {sent && <form onSubmit={verify} className="auth-form account-stack">
                    <VerificationCodeField value={code} onChange={setCode}/>
                    <Button type="submit" className={`${submitButtonClassName} account-primary`} style={submitButtonStyle} isLoading={busy} isDisabled={busy || !code}>Verify and continue</Button>
                </form>}
                <Button className={sent ? 'account-text-action' : `${submitButtonClassName} account-primary`} style={sent ? undefined : submitButtonStyle}
                    variant={sent ? 'light' : 'solid'} type="button" isDisabled={busy || !user?.primaryEmailAddress} isLoading={busy && !sent} onPress={send}>
                    {sent ? 'Send a new code' : 'Send verification code'}
                </Button>
            </>}
        <AccountError>{error}</AccountError>
        <div className="space-y-2">
            <p className="account-description">No longer have access to this inbox? <a className="account-link" href="mailto:hello@bible.game">Contact support</a>.</p>
            <button className="account-text-action" onClick={() => void signOut({ redirectUrl: '/account/log-in?next=' + encodeURIComponent(next) })}>Use a different account</button>
        </div>
    </div>;
}
