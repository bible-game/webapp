"use client";

import { useActionState } from "react";
import { Button, Input } from "@heroui/react";
import { UserRound } from "lucide-react";
import { completeProfile } from "@/core/action/account/complete-profile";
import { inputClassNames, submitButtonClassName, submitButtonStyle } from "@/core/model/form/form-styles";
import { AccountError, AccountHeading } from "@/core/component/account/account-presentation";

export function ProfileFields({ firstname, lastname, disabled = false }: {
    firstname: string; lastname: string; disabled?: boolean;
}) {
    return <>
        {!firstname.trim() && <Input classNames={inputClassNames} label="First name" name="firstname" autoComplete="given-name"
            variant="bordered" isRequired spellCheck="false" maxLength={255} isDisabled={disabled} startContent={<UserRound className="size-5 shrink-0 text-ui-faint"/>}/>}
        {!lastname.trim() && <Input classNames={inputClassNames} label="Last name" name="lastname" autoComplete="family-name"
            variant="bordered" isRequired spellCheck="false" maxLength={255} isDisabled={disabled} startContent={<UserRound className="size-5 shrink-0 text-ui-faint"/>}/>}
    </>;
}

export default function ProfileForm({ owner, next, firstname, lastname }: {
    owner: string; next: string; firstname: string; lastname: string;
}) {
    const [state, action, busy] = useActionState(completeProfile, { error: '' });
    return <form action={action} className="auth-form account-stack">
        <AccountHeading title="Complete your profile">{firstname.trim() && lastname.trim()
            ? `Continue as ${firstname} ${lastname}.`
            : 'Add your first and last names to continue.'}</AccountHeading>
        <input type="hidden" name="owner" value={owner}/><input type="hidden" name="next" value={next}/>
        <ProfileFields firstname={firstname} lastname={lastname} disabled={busy}/>
        <AccountError>{state.error}</AccountError>
        <div className="account-actions">
            <Button className={`${submitButtonClassName} account-primary`} style={submitButtonStyle} type="submit" name="intent" value="save" isLoading={busy} isDisabled={busy}>Save and continue</Button>
        </div>
    </form>;
}
