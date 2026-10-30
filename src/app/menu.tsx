"use client";

import AppHeader, { type AppHeaderProps } from "@/core/component/app-header";

export default function Menu(props: AppHeaderProps) {
    return <div className="app-header"><AppHeader {...props}/></div>;
}
