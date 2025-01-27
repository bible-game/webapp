"use client"

import React from "react";
import Leaf from "@/app/game/leaf/Leaf";

const Selection = (props: any) => {

    return <>
        <p className="my-8">{props.selection}</p>
        <div className="flex flex-wrap">
            {props.options.map((option: any) =>
                <div className="w-[12rem]" onClick={(): any => props.guess(option)}><Leaf content={option} /></div>
            )}
        </div>
    </>
}

export default Selection;