"use client"

import React, { useEffect, useState } from "react";
import { Guesses } from "@/app/play/[game]/guess";
import { distanceOf } from "@/app/play/[game]/closeness";

const text = "text-[17px] font-light leading-[1.3] text-[#cccccc] text-center";

/**
 * Summary: the passage summary, cut to one line once play has begun, above a row of every guess (and the missed answer).
 * Tapping it shows the full summary over the map.
 */
const Summary = (props: any) => {
    const [expanded, setExpanded] = useState(false);
    const guesses: any[] = props.guesses || [];
    const started = guesses.length > 0;
    const won = guesses.some((guess) => distanceOf(guess) === 0);

    // collapse when a new guess lands, so the latest result shows in the row
    useEffect(() => setExpanded(false), [guesses.length, props.playing]);

    if (!props.passage) return null;

    return (
        <section className="relative z-20 !w-full shrink-0">
            <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}
                    className={"flex w-full items-center justify-center px-6 " + (started ? "h-[26px]" : "h-[50px]")}>
                <p className={text + " min-w-0 " + (started ? "truncate" : "line-clamp-2 text-balance")}>
                    {props.passage.summary}
                </p>
            </button>

            {started ?
                <Guesses guesses={guesses} answer={!props.playing && !won ? props.passage : undefined}/> : null}

            <div className="mt-0.5 h-0.5 bg-[#363636]" aria-hidden="true"/>

            {expanded ?
                <button type="button" aria-label="Close summary" onClick={() => setExpanded(false)}
                        className="absolute inset-x-0 top-0 bg-[#0d0e0f] px-6 pb-5 pt-1 shadow-[0_12px_24px_#0d0e0f]">
                    <p className={text + " text-balance"}>{props.passage.summary}</p>
                </button> : null
            }
        </section>
    );
}

export default Summary;
