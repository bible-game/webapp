"use client"

import React from "react";
import { Chip } from "@nextui-org/chip";

const Summary = (props: any) => {
    if (props.passage) return (
        <section
            className={"pointer-events-auto p-1 sm:p-3 sm:h-[52px] " + (!props.playing ? "flex justify-between gap-6 sm:gap-2 px-5" : "text-center")}>
            <div className={"text-[13px] sm:text-[14px] opacity-80 " + (!props.playing ? "ml-2" : "")}>️️️
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