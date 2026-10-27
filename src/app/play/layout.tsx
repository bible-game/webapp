import React from "react";
import "./play.sass";
import PlaySkeleton from "@/app/play/[game]/skeleton";

/** Holds Play's one skeleton, which stays put while the server fetches a day and the browser takes over */
export default function PlayLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <PlaySkeleton/>
            {children}
        </>
    );
}
