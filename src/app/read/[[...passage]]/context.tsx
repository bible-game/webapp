"use client"

import React, { useState } from "react";
import { Accordion, AccordionItem, Spinner } from "@heroui/react";
import { getPostContext } from "@/core/action/read/get-postcontext";
import { getPreContext } from "@/core/action/read/get-precontext";
import {InfoCircleIcon} from "@heroui/shared-icons";

const Context = (props: any) => {
    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);
    const [title] = useState(props.context == "before" ? "Pre‑Context" : "Post‑Context");

    function toggle(e: any): void {
        if (!context && e.size) {
            setLoading(true);
            (props.context == "after" ? getPostContext : getPreContext)(props.passageKey).then((ctx: any) => {
                setContext(ctx.text);
                setLoading(false);
            });
        }
    }

    return (
        <Accordion
            className="opacity-90 bg-white/80 backdrop-blur-sm ring-1 ring-indigo-500 rounded-2xl p-3 sm:p-4"
            itemClasses={{title: "text-indigo-700 font-medium", indicator: "text-indigo-700", startContent: "text-indigo-700 bg-red"}}
            onSelectionChange={toggle}
            isCompact
        >
            <AccordionItem key="1" aria-label="context" title={title}>
                {loading ? (
                    <Spinner color="primary" />
                ) : (
                    <p className="max-w-[65ch] text-sm leading-6 text-indigo-700">{context}</p>
                )}
            </AccordionItem>
        </Accordion>
    );
};

export default Context;