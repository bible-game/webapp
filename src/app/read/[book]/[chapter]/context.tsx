"use client"

import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";

const Context = (props: any) => {

    // TODO :: quality of life -> make accordion colour match the division
    return <Accordion className="bg-secondary-50 p-4 rounded">
        <AccordionItem key="1" aria-label="pre-context" title="Context" className="text-secondary-800">
            <p className="max-w-[16rem] sm:max-w-[38rem] font-light text-sm leading-6 text-secondary-800">{props.content}</p>
        </AccordionItem>
    </Accordion>
}

export default Context;