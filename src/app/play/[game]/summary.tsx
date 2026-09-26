"use client"

import React from "react";

const Summary = (props: any) => {
    if (!props.passage) return null;

    return (
        <section className="pointer-events-auto !w-fit max-w-[calc(100vw-2rem)] bg-[#0a0b0c] px-2 pb-1 text-left sm:max-w-[34rem]">
            <div className="text-[10px] uppercase leading-[1.9] tracking-[0.22em] text-[#a19d94]">
                Bible Game
            </div>
            <p className="m-0 max-w-[30ch] text-balance text-[17px] leading-[1.35] tracking-0 text-[#f2efe8] sm:text-[20px]">
                &ldquo;{props.passage.summary}&rdquo;
            </p>
            <div className={"mt-1 text-[10px] uppercase leading-[2.2] tracking-[0.22em] text-[#f2efe8] " + (props.playing ? "hidden" : "")}>
                {props.passage.book + " " + props.passage.chapter}
            </div>
        </section>
    );
}

export default Summary;
