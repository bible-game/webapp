import type { ReactNode } from "react";

export function AccountHeading({ title, children }: { title: string; children?: ReactNode }) {
    return <header className="account-heading"><h1 className="account-title">{title}</h1>
        {children && <p className="account-description">{children}</p>}</header>;
}

export function AccountError({ children }: { children?: ReactNode }) {
    return children ? <p role="alert" className="account-alert">{children}</p> : null;
}
