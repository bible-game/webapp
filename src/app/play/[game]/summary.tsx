"use client"

import React from "react";
import { Chip } from "@nextui-org/chip";

const Summary = (props: any) => {
    if (props.passage) return (
        <section
            className={"pointer-events-auto p-4 sm:p-6 max-w-[90vw] sm:max-w-2xl transition-opacity duration-500 "
                + (props.hidden ? "opacity-0 pointer-events-none " : "opacity-100 ")
                + (!props.playing ? "flex flex-col items-center gap-3" : "text-center")}>
            <div className="text-xl sm:text-3xl opacity-80 text-center leading-snug">️️️
                {props.passage.summary}
            </div>
            <Chip size="sm"
                  variant="solid"
                  classNames={{
                      base: `opacity-90 bg-gradient-to-br from-green-100 to-green-300 border border-white/50 h-7 mt-0.5 ${props.playing ? "hidden" : ""}`,
                      content: "text-black font-medium px-2 py-1 tracking-wide text-center text-[11px]"
                  }}>
                {props.passage.book + " " + props.passage.chapter}
            </Chip>
        </section>
    )
}

export default Summary;