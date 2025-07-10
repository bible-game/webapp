"use client"

import React, { useState } from "react";
import { Accordion, AccordionItem, Spinner } from "@heroui/react";
import { getPostContext } from "@/core/action/get-postcontext";
import { getPreContext } from "@/core/action/get-precontext";

const Context = (props: any) => {

    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);

    const [title] = useState(props.context == 'before' ? 'Before' : 'After');
    const [subtitle] = useState(props.context == 'before' ? `Click for context leading up to ${props.passageKey}` : `Click to understand the events following ${props.passageKey}`);

    function toggle(e: any): void {
        if (!context && e.size) {
            setLoading(true);

            (props.context == 'after' ? getPostContext : getPreContext)(props.passageKey).then((ctx: any) => {
                setContext(ctx.text);
                setLoading(false);
            });
        }
    }

    // TODO :: quality of life -> make accordion colour match the division?
    return <Accordion className="bg-secondary-50 p-4 rounded" onSelectionChange={toggle}>
        <AccordionItem key="1" aria-label="pre-context" title={title} subtitle={subtitle} className="text-secondary-800">
            {
                loading ? <Spinner color="secondary"/> :
                    <p className="max-w-[16rem] sm:max-w-[38rem] font-light text-sm leading-6 text-secondary-800">{context}</p>
            }

        </AccordionItem>
    </Accordion>
}

export default Context;