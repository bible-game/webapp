"use client"

import React, { useMemo } from "react";

const Guess = (props: any) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });

    const passage = useMemo(() => formatPassage(props.book, props.chapter), [props.book, props.chapter]);
    const distance = props.closeness ? parseInt(props.closeness.distance) : null;
    const found = distance === 0;

    function formatPassage(book: any, chapter: any): string {
        if (!book || !chapter) return "";
        return `${book.substring(0, book.split(" ").length > 1 ? 4 : 3).toUpperCase()} ${chapter}`;
    }

    return (
        <div className={"grid h-[26px] grid-cols-[1fr_auto_3.8rem] items-center gap-2 whitespace-nowrap " + (found ? "text-[#f2efe8]" : "text-[#a19d94]")}>
            <span className="overflow-hidden text-ellipsis text-[10px] uppercase tracking-[0.16em]">
                {passage}
            </span>
            <span className="text-right text-[10px] text-[#5c5954]">
                {distance === null || found ? "" : distance < 0 ? "▲" : "▼"}
            </span>
            <span className="text-right text-[10px] uppercase tracking-[0.16em]">
                {found ? "Found" : distance === null ? "" : formatter.format(Math.abs(distance))}
            </span>
        </div>
    );
}

export default Guess;
