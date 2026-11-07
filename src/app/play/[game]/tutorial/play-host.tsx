"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Game from "@/app/play/[game]/game";
import Tutorial, { tutorialSeen } from "@/app/play/[game]/tutorial/tutorial";
import RoundTips, { roundTipsSeen } from "@/app/play/[game]/tutorial/round-tips";
import { practicePassage } from "@/app/play/[game]/tutorial/practice";
import { TUTORIAL_EVENT } from "@/app/play/[game]/help";
import { StateUtil } from "@/core/util/state-util";

/**
 * Who it's for: someone new, as this device knows them. Not logged in, and with no game kept on this device, so a
 * player is never shown it (or their round touched); and not once they've seen it. The round's notes go to the same
 * people, until their first guess has been explained
 */
function welcome(loggedIn: boolean): { tour: boolean; tips: boolean } {
    if (loggedIn) return { tour: false, tips: false };
    let fresh = false;
    try { fresh = StateUtil.getAllGames().size === 0; } catch { /* storage unreadable: treat as a player */ }
    return { tour: fresh && !tutorialSeen(), tips: fresh && !roundTipsSeen() };
}

/**
 * The Play page with the first-visit tutorial. For a new visitor the tutorial plays first,
 * made of the genuine page: while it runs the page shows a sample day (Psalm 127, practice.ts) as a demo round, which
 * starts empty and keeps nothing (Game's `demo`), so today's chapter is never given away and no game is saved or sent.
 * The wrapper holds the page's parts back (data-reveal, tutorial.sass) from its first paint, so it's never seen whole
 * and then hidden. When it ends the page is made afresh as today's game, with the round's notes (round-tips.tsx). How
 * to play's Tutorial (TUTORIAL_EVENT) plays it again, for anyone, the same way: their own round isn't touched.
 *
 * On the home page (`landing`), the landing lies over the page (data-landing, home/landing.sass): the Game shows today's
 * map clean and keeps its sheet back (Game's `landing`), and nothing plays. When the landing goes (Play), the same page
 * carries on: into the tutorial, keeping the map the landing showed (data-map-kept), or straight into the round
 */
export default function PlayHost(props: any) {
    // decided once, in the browser (the page's games are on this device); the server renders the bare page, which the
    // Game itself only fills in once in the browser
    const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
    const decided = useRef<{ tour: boolean; tips: boolean } | null>(null);
    if (mounted && !decided.current) decided.current = welcome(!!props.loggedIn);

    // once asked for again (How to play) or done, the tutorial follows that rather than the first decision
    const [asked, setAsked] = useState<boolean | null>(null);
    const landing = !!props.landing;
    const touring = !landing && (asked ?? decided.current?.tour ?? false);
    const tips = !landing && (decided.current?.tips ?? false);
    // a tutorial that follows straight on from the landing keeps the map it showed (tutorial.sass)
    const fromLanding = useRef(landing);
    if (landing) fromLanding.current = true;
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

    const reset = useCallback(() => setRound(r => r + 1), []);
    const done = useCallback(() => { setStage(0); setAsked(false); }, []);

    return <div data-landing={landing ? "" : undefined} data-reveal={touring ? stage : undefined}
                data-map-kept={touring && fromLanding.current ? "" : undefined}>
        {touring ?
            <Game key={`demo-${round}`} {...props} demo passage={sample} played={undefined}/> :
            <Game key="game" {...props}/>}
        {touring ? <Tutorial key={`tutorial-${run}`} onStage={setStage} onReset={reset} onDone={done}/>
            : tips ? <RoundTips passage={props.passage} bible={props.bible}/> : null}
    </div>;
}
