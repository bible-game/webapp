"use client"

import React, { useEffect, useState } from "react";
import { Tooltip } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

/** The same swap as Play's share button, so the button can say what happened itself */
const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.18 } };

type Props = { read: boolean; onMark: () => void };

/**
 * Marks the passage read; once it is, it stays disabled and explains why
 * @since 8th October 2026
 */
export default function MarkReadButton({ read, onMark }: Props) {
    // true for a moment after marking, so the button confirms it before settling
    const [marked, setMarked] = useState(false);
    const [tip, setTip] = useState(false);

    useEffect(() => {
        if (!marked) return;
        const t = setTimeout(() => setMarked(false), 1800);
        return () => clearTimeout(t);
    }, [marked]);

    // A tapped tooltip has no hover to end it, so let it go after a moment
    useEffect(() => {
        if (!tip) return;
        const t = setTimeout(() => setTip(false), 2500);
        return () => clearTimeout(t);
    }, [tip]);

    const label = marked ? "marked" : read ? "read" : "mark";

    // A disabled button takes no pointer or focus, so a wrapper carries the tooltip.
    // The structure stays the same either way, so marking doesn't remount the button mid-swap.
    return (
        <Tooltip content="This passage is already tracked as read" placement="top" showArrow
                 isDisabled={!read} isOpen={read && tip} onOpenChange={setTip}
                 classNames={{ content: "max-w-[calc(100vw-2rem)] rounded-lg border border-ui-line bg-ui-raised px-3 py-2 text-[13px] text-ui-text" }}>
            <span tabIndex={read ? 0 : -1} className="grid rounded-lg" onClick={() => read && setTip(true)}>
                <button type="button" disabled={read} aria-live="polite"
                        onClick={() => { onMark(); setMarked(true); }}
                        className={`ui-button w-full overflow-hidden ${read ? "reader-done" : "reader-primary"}`}>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={label} {...fade} className="flex items-center gap-2">
                            {label === "mark" ? <><Circle className="size-4" />Mark as read</> :
                                label === "marked" ? <><CheckCircle2 className="size-4" />Marked as read</> :
                                    <><CheckCircle2 className="size-4" />Read</>}
                        </motion.span>
                    </AnimatePresence>
                </button>
            </span>
        </Tooltip>
    );
}
