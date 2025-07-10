"use client"

import React, { useState } from "react";
import { Accordion, AccordionItem, Spinner } from "@heroui/react";
import { getPostContext } from "@/core/action/get-postcontext";
import { getPreContext } from "@/core/action/get-precontext";

const Context = (props: any) => {

    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);

    const [title] = useState(props.context == 'before' ? 'Pre-Context' : 'Post-Context');

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
    return <Accordion className="opacity-80 bg-gradient-to-bl from-blue-50 to-blue-100 p-4 rounded border-1 border-blue-200 text-blue-700 font-light" onSelectionChange={toggle} isCompact={true}>
        <AccordionItem key="1" aria-label="context" title={title}>
            {
                loading ? <Spinner color="primary"/> :
                    <p className="max-w-[16rem] sm:max-w-[38rem] font-extralight text-sm leading-6 text-gray-700">{context}</p>
            }

        </AccordionItem>
    </Accordion>
}

export default Context;