"use client"

import React from "react";
import { Tooltip } from "@heroui/react";

const Cell = (props: any) => {

    const style = () => {
        let colour = "bg-white opacity-5";

        if (props.chapter == 1) colour = "bg-orange-500 opacity-85"
        if (props.chapter == 2) colour = "bg-green-500 opacity-85"

        return `h-[12px] w-[12px] m-0.5 cursor-pointer rounded-sm ${colour}`;
    }

    return <>
        <Tooltip content={props.label} color="primary" offset={1}>
            <div className={style()}></div>
        </Tooltip>
    </>

}

export default Cell;