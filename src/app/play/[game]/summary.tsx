"use client"

import React from "react";
import { Chip } from "@nextui-org/chip";

const Summary = (props: any) => {
    if (props.passage) return (
        <section
            className={"relative z-10 sm:left-[calc(50%-23rem)] sm:panel p-1 sm:p-4 sm:h-[66px] " + (!props.playing ? "flex justify-between gap-6 sm:gap-2 px-6" : "text-center")}>
            <div className={"text-[14px] sm:text-[16px] opacity-80 " + (!props.playing ? "ml-2" : "")}>️️️
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