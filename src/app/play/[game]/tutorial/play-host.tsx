"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Game from "@/app/play/[game]/game";
import Tutorial, { onboarded } from "@/app/play/[game]/tutorial/tutorial";
import RoundTips from "@/app/play/[game]/tutorial/round-tips";
import { practicePassage } from "@/app/play/[game]/tutorial/practice";
import { TUTORIAL_EVENT } from "@/app/play/[game]/help";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Who the tutorial is for: anyone, logged in or not, whose device has no onboarded flag yet (tutorial.tsx sets it when the
 * tutorial ends, finished or skipped)
 */
const welcome = (): boolean => onboarded() === null;

/**
 * The Play page with the onboarding tutorial. For anyone not yet onboarded (no `onboarded` flag) the tutorial plays first,
 * made of the genuine page: while it runs the page shows a sample day (Psalm 127, practice.ts) as a demo round, which
 * starts empty and keeps nothing (Game's `demo`), so today's chapter is never given away and no game is saved or sent.
 * The wrapper holds the page's parts back (data-reveal, tutorial.sass) from its first paint, so it's never seen whole
 * and then hidden. When it ends the page is made afresh as today's game, with the round's notes (round-tips.tsx). How
 * to play's Tutorial (TUTORIAL_EVENT) plays it again, for anyone, the same way: their own round isn't touched.
 *
 * On the home page (`landing`), the landing lies over the page (data-landing, home/landing.sass): the Game shows today's
 * map clean and keeps its sheet back (Game's `landing`), and nothing plays. When the landing goes (Play), the same page
 * carries on: into the tutorial, whose first step dissolves the map the landing showed (it comes back with the map's
 * step), or straight into the round, keeping the map where the landing left it
 */
export default function PlayHost(props: any) {
    // decided once, in the browser (the page's games are on this device); the server renders the bare page, which the
    // Game itself only fills in once in the browser
    const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
    const decided = useRef<boolean | null>(null);
    if (mounted && decided.current === null) decided.current = welcome();

    // once asked for again (How to play) or done, the tutorial follows that rather than the first decision
    const [asked, setAsked] = useState<boolean | null>(null);
    const landing = !!props.landing;
    const touring = !landing && (asked ?? decided.current ?? false);
    const [stage, setStage] = useState(0);
    // each Restart makes the demo round afresh; each replay starts the tutorial afresh
    const [round, setRound] = useState(0);
    const [run, setRun] = useState(0);
    const sample = useMemo(() => practicePassage(), [run]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const again = () => { setStage(0); setRound(r => r + 1); setRun(r => r + 1); setAsked(true); };
        window.addEventListener(TUTORIAL_EVENT, again);
        return () => window.removeEventListener(TUTORIAL_EVENT, again);
    }, []);

    // today's passage for the round's notes: the server's, else the one the Game fetches (the same request, shared), as
    // the home page sends none when it couldn't tell the visitor's date (a first visit, before their timezone is known),
    // and the first guess's reading needs the answer to read it against
    const { data: daily } = useSWR(props.passage ? null : `${process.env.SVC_PASSAGE}/daily/${props.game}`, fetcher);
    const passage = props.passage ?? daily;

    const reset = useCallback(() => setRound(r => r + 1), []);
    const done = useCallback(() => { setStage(0); setAsked(false); }, []);

    return <div data-landing={landing ? "" : undefined} data-reveal={touring ? stage : undefined}>
        {touring ?
            <Game key={`demo-${round}`} {...props} demo passage={sample} played={undefined}/> :
            <Game key="game" {...props}/>}
        {touring ? <Tutorial key={`tutorial-${run}`} onStage={setStage} onReset={reset} onDone={done}/>
            : landing ? null : <RoundTips passage={passage} bible={props.bible}/>}
    </div>;
}
