"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Guesses } from "@/app/play/[game]/guess";
import { distanceOf } from "@/app/play/[game]/closeness";

const text = "font-clue text-[21px] font-medium leading-[1.25] tracking-normal text-play-text text-center text-balance";

/**
 * Summary: the passage summary (the day's clue, up to two lines) above a row of guess slots.
 * When the clue is cut short, a chevron shows; tapping it shows the full summary over the map.
 */
const Summary = (props: any) => {
    const [expanded, setExpanded] = useState(false);
    const [clipped, setClipped] = useState(false);
    const clue = useRef<HTMLParagraphElement>(null);
    const guesses: any[] = props.guesses || [];
    const won = guesses.some((guess) => distanceOf(guess) === 0);

    // collapse when a new guess lands, so the latest result shows in the row
    useEffect(() => setExpanded(false), [guesses.length, props.playing]);

    useLayoutEffect(() => {
        const element = clue.current;
        if (!element) return;

        const measure = () => setClipped(element.scrollHeight > element.clientHeight + 1);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [props.passage?.summary]);

    if (!props.passage) return null;

    return (
        <section className="relative z-20 !w-full shrink-0 border-b border-play-line pb-3">
            <button type="button" aria-expanded={expanded} disabled={!clipped && !expanded}
                    onClick={() => setExpanded(!expanded)}
                    className="flex min-h-[60px] w-full flex-col items-center justify-center px-6 pb-2.5 pt-1">
                <p ref={clue} className={text + " line-clamp-2 min-w-0"}>{props.passage.summary}</p>
                {clipped ? <ChevronDownIcon className="-mb-1 size-4 text-play-faint" aria-hidden="true"/> : null}
            </button>

            <Guesses guesses={guesses} answer={!props.playing && !won ? props.passage : undefined}/>

            {expanded ?
                <button type="button" aria-label="Close summary" onClick={() => setExpanded(false)}
                        className="absolute inset-x-0 top-0 flex flex-col items-center rounded-b-2xl border-b border-play-line bg-play-bg px-6 pb-4 pt-1 shadow-[0_16px_32px_rgba(0,0,0,0.6)]">
                    <p className={text}>{props.passage.summary}</p>
                    <ChevronDownIcon className="mt-1 size-4 rotate-180 text-play-faint" aria-hidden="true"/>
                </button> : null
            }
        </section>
    );
}

export default Summary;
