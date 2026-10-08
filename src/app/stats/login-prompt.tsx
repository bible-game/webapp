"use client";

import { useState } from "react";
import Link from "next/link";
import { XIcon } from "lucide-react";

export default function LoginPrompt(props: any) {
    const [dismissed, setDismissed] = useState(false);
    if (props.authenticated || dismissed) return null;
    return <div className="my-4 flex items-center gap-3 border-b border-ui-line pb-4">
        <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-ui-muted"><Link href="/account/log-in" className="font-semibold text-ui-text underline underline-offset-4">Log in</Link> to save your progress across devices.</p>
        <button type="button" className="ui-icon" aria-label="Dismiss login reminder" onClick={() => setDismissed(true)}><XIcon className="size-5"/></button>
    </div>;
}
