"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Guesses } from "@/app/play/[game]/guess";
import { distanceOf } from "@/app/play/[game]/closeness";

const text = "font-mono text-[18px] font-normal leading-[1.45] tracking-normal text-play-text text-center text-balance";

/** Clue sizes, largest first: the clue takes the largest that keeps it to two lines */
const SIZES = [18, 17, 16, 15];

/**
 * Summary: the passage summary (the day's clue, up to two lines) above a row of guess slots.
 * A long clue steps down in size to stay within two lines; only if it is still cut short at the smallest does a
 * chevron show, and tapping it shows the full summary over the map.
 */
const Summary = (props: any) => {
    const [expanded, setExpanded] = useState(false);
    const [clipped, setClipped] = useState(false);
    const [size, setSize] = useState(SIZES[0]);
    const clue = useRef<HTMLParagraphElement>(null);
    const guesses: any[] = props.guesses || [];
    const won = guesses.some((guess) => distanceOf(guess) === 0);

    // collapse when a new guess lands, so the latest result shows in the row
    useEffect(() => setExpanded(false), [guesses.length, props.playing]);

    useLayoutEffect(() => {
        const element = clue.current;
        if (!element) return;

        const overflows = () => element.scrollHeight > element.clientHeight + 1;
        const measure = () => {
            const fit = SIZES.find((candidate) => {
                element.style.fontSize = `${candidate}px`;
                return !overflows();
            }) ?? SIZES[SIZES.length - 1];
            element.style.fontSize = `${fit}px`;
            setSize(fit);
            setClipped(overflows());
        };
        measure();
        // the box is clamped to two lines, so a late-loading face that adds a line won't resize it: measure again
        document.fonts.ready.then(measure);
        // the clue is centred and shrink-wraps its text, so also watch its full-width container for the room it has
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        if (element.parentElement) observer.observe(element.parentElement);
        return () => observer.disconnect();
    }, [props.passage?.summary]);

    if (!props.passage) return null;

    return (
        <section className="relative z-20 !w-full shrink-0 border-b border-play-line pb-3">
            <button type="button" aria-expanded={expanded} disabled={!clipped && !expanded}
                    onClick={() => setExpanded(!expanded)}
                    className="flex min-h-[60px] w-full flex-col items-center justify-center px-6 pb-4 pt-1">
                <p ref={clue} className={text + " line-clamp-2 min-w-0"} style={{ fontSize: size }}>{props.passage.summary}</p>
                {clipped ? <ChevronDownIcon className="-mb-1 size-4 text-play-faint" aria-hidden="true"/> : null}
            </button>

            <Guesses guesses={guesses} answer={!props.playing && !won ? props.passage : undefined}/>

            {expanded ?
                <button type="button" aria-label="Close summary" onClick={() => setExpanded(false)}
                        className="absolute inset-x-0 top-0 flex flex-col items-center rounded-b-lg border-b border-play-line bg-play-bg px-6 pb-4 pt-1 shadow-[0_16px_32px_rgba(0,0,0,0.6)]">
                    <p className={text} style={{ fontSize: size }}>{props.passage.summary}</p>
                    <ChevronDownIcon className="mt-1 size-4 rotate-180 text-play-faint" aria-hidden="true"/>
                </button> : null
            }
        </section>
    );
}

export default Summary;
