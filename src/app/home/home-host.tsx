"use client"

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import moment from "moment";
import useSWR from "swr";
import LandingOverlay, { type LandingAccount } from "@/app/home/landing-overlay";
import PlayHost from "@/app/play/[game]/tutorial/play-host";
import { onboarded } from "@/app/play/[game]/tutorial/tutorial";
import "@/app/play/play.sass";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** How long the landing takes to dissolve, map and all, before the tutorial takes over (ms): its fade (LEAVE), and most
 * of the map's (tutorial.sass, 0.7s) */
const DISSOLVE = 650;
/** The landing's own fade, going (s); opacity only: a filter would pin its fixed places to its scrolled-away top */
const LEAVE = { duration: 0.6, ease: [0.22, 0.8, 0.24, 1] as const };

/**
 * The home page over today's game: the Play page is already here, under the landing
 * (landing-overlay.tsx), with today's map shown clean (Game's `landing`), so Play doesn't load another page. It moves
 * the address to today's game (history.pushState: the app router keeps this page and follows the address), the landing
 * dissolves off it, and the game carries on from there, into the tutorial or the round. Back returns the address to
 * the home page, and the landing comes back over the game. A reload there loads the Play page itself
 */
export default function HomeHost(props: any) {
    const router = useRouter();
    const pathname = usePathname();
    // logged-in players are sent on to today's game by the server (middleware.ts) before this page is drawn; everyone
    // else gets the landing here, or at /explore (the drawer's logo)
    const landing = pathname === "/" || pathname === "/explore";
    // today, as the server worked it out from the visitor's timezone; else as the browser has it (the Game only renders
    // in the browser)
    const game: string = props.today ?? moment().format("YYYY-MM-DD");
    // today's clue, for the landing's last screen: the passage the server sent, else the one the Game fetches (the same
    // request, shared)
    const { data } = useSWR(props.passage ? null : `${process.env.SVC_PASSAGE}/daily/${game}`, fetcher);
    const summary: string | undefined = (props.passage ?? data)?.summary;
    const account: LandingAccount = props.info ? "member" : props.known ? "known" : "guest";

    // Play: the tutorial (for anyone not yet onboarded) begins on its words alone, on an empty ground, so the whole
    // landing dissolves first, the map with it (landing.sass, data-map-leaving), and only then does the page move on and
    // build the tutorial's round, out of sight; straight into the round, the map stays just where it is and the landing
    // fades off it. The scroll goes back to the top once the landing has gone (onExitComplete): before, it would wind the
    // landing's story back while it was still showing
    const [leaving, setLeaving] = useState(false);
    const pressed = useRef(false);
    // the map stays dissolved (data-map-leaving) until the landing has really gone, however long the page takes to move
    // on; a timer could lift it early and bring the landing's map back before the tutorial arrives. Back brings it back
    const clearMapLeaving = useCallback(() => document.querySelector("[data-map-leaving]")?.removeAttribute("data-map-leaving"), []);
    useEffect(() => { if (landing) { setLeaving(false); pressed.current = false; clearMapLeaving(); } }, [landing, clearMapLeaving]);
    const play = useCallback(() => {
        if (pressed.current) return;
        pressed.current = true;
        const go = () => window.history.pushState(null, "", `/play/${game}`);
        // the landing fades the same way either way (its transition, below); only the tutorial waits for it
        setLeaving(true);
        const wrapper = document.querySelector("[data-landing]");
        if (onboarded() !== null || !wrapper) return go();
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        wrapper.setAttribute("data-map-leaving", "");
        window.setTimeout(go, still ? 0 : DISSOLVE);
    }, [game]);
    const signUp = useCallback(() => router.push("/account/sign-up"), [router]);
    const logIn = useCallback(() => router.push("/account/log-in?next=/play/today"), [router]);

    return <>
        <PlayHost game={game} bible={props.bible} divisions={props.divisions} books={props.books} device={props.device}
                  passage={props.passage} played={props.played} loggedIn={props.loggedIn} info={props.info} known={props.known}
                  landing={landing}/>
        <AnimatePresence initial={false} onExitComplete={() => { window.scrollTo({ top: 0 }); clearMapLeaving(); }}>
            {/* no filter, coming or going: a filter (even a nil blur) would make its fixed places scroll with it */}
            {landing ? <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={LEAVE}>
                {/* Play: the landing fades by a plain transition, which holds at nothing until it's gone (an animated opacity,
                    settling, handed the landing back whole for a moment); the exit above only times its leaving */}
                <div className="transition-opacity duration-[600ms] ease-[cubic-bezier(0.22,0.8,0.24,1)] motion-reduce:transition-none"
                     style={{ opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : undefined }}>
                    <LandingOverlay onPlay={play} onSignUp={signUp} onLogIn={logIn} account={account} summary={summary} info={props.info}/>
                </div>
            </motion.div> : null}
        </AnimatePresence>
    </>;
}
