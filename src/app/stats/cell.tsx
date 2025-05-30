"use client"

import React from "react";
import { Tooltip } from "@heroui/react";

const Cell = (props: any) => {

    const style = () => {
        let colour = "bg-white opacity-5 hover:opacity-20 duration-200";

        if (props.chapter == 1) colour = "bg-[#FFB86C] opacity-85 hover:opacity-95 duration-200"
        if (props.chapter == 2) colour = "bg-[#50FA7B] opacity-85 hover:opacity-95 duration-200"

        return `h-[12px] w-[12px] m-0.5 cursor-pointer rounded-sm ${colour}`;
    }

    const colour = () => {
        let colour = 'p-0.5';

        if (props.chapter == 1) colour = " text-[#FFB86C]"
        if (props.chapter == 2) colour = " text-[#50FA7B]"

        return colour;
    }

    return <>
        <Tooltip offset={1} className="text-tiny bg-[#060842]" content={
            <div className={colour()}>{props.label}</div>
        }>
            <div className={style()}></div>
        </Tooltip>
    </>

}

export default Cell;