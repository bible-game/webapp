"use client"

import React, { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import moment from "moment";
import useSWR from "swr";
import LandingOverlay, { type LandingAccount } from "@/app/home/landing-overlay";
import PlayHost from "@/app/play/[game]/tutorial/play-host";
import "@/app/play/play.sass";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
    const landing = pathname === "/";
    // today, as the server worked it out from the visitor's timezone; else as the browser has it (the Game only renders
    // in the browser)
    const game: string = props.today ?? moment().format("YYYY-MM-DD");
    // today's clue, for the landing's last screen: the passage the server sent, else the one the Game fetches (the same
    // request, shared)
    const { data } = useSWR(props.passage ? null : `${process.env.SVC_PASSAGE}/daily/${game}`, fetcher);
    const summary: string | undefined = (props.passage ?? data)?.summary;
    const account: LandingAccount = props.info ? "member" : props.known ? "known" : "guest";

    const play = useCallback(() => {
        window.history.pushState(null, "", `/play/${game}`);
        window.scrollTo({ top: 0 });
    }, [game]);
    const signUp = useCallback(() => router.push("/account/sign-up"), [router]);
    const logIn = useCallback(() => router.push("/account/log-in?next=/play/today"), [router]);

    return <>
        <PlayHost game={game} bible={props.bible} divisions={props.divisions} books={props.books} device={props.device}
                  passage={props.passage} played={props.played} loggedIn={props.loggedIn} info={props.info} known={props.known}
                  landing={landing}/>
        <AnimatePresence initial={false}>
            {/* no filter while it shows: a filter (even a nil blur) would make its fixed places scroll with it */}
            {landing ? <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                   exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.6, ease: [0.22, 0.8, 0.24, 1] }}>
                <LandingOverlay onPlay={play} onSignUp={signUp} onLogIn={logIn} account={account} summary={summary} info={props.info}/>
            </motion.div> : null}
        </AnimatePresence>
    </>;
}
