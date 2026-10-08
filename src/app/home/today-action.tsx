"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import useSWR from "swr";
import { PlayIcon, TrophyIcon } from "lucide-react";
import { GameState } from "@/core/model/state/game-state";
import { StateUtil } from "@/core/util/state-util";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const GUESSES = 5;

/** Time until the next daily chapter, at local midnight */
function useUntilTomorrow(enabled: boolean): string {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!enabled) return;
        const timer = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(timer);
    }, [enabled]);

    const minutes = Math.max(1, Math.ceil(moment(now).endOf("day").diff(moment(now), "minutes", true)));
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

/**
 * The home page's main action, reflecting today's game: start it, continue it, or see how it went
 */
export default function TodayAction({ state }: { state?: Map<number, GameState> }) {
    const { data: passage } = useSWR(`${process.env.SVC_PASSAGE}/daily/${moment().format("YYYY-MM-DD")}`, fetcher);
    const [game, setGame] = useState<GameState>();

    useEffect(() => {
        if (!passage?.id) return;
        try {
            setGame(state?.get(passage.id) ?? StateUtil.getAllGames().get(passage.id));
        } catch {
            // storage unavailable: offer a fresh game
        }
    }, [passage?.id, state]);

    const started = !!game?.guesses?.length;
    const finished = started && !game.playing;
    const until = useUntilTomorrow(finished);
    const chapter = `${game?.passageBook} ${game?.passageChapter}`;

    const label = finished ? "See today's result" : started ? "Continue today's chapter" : "Play today's chapter";
    const Icon = finished ? TrophyIcon : PlayIcon;
    const status = finished ? (game.stars > 0 ? `Found ${chapter} in ${game.guesses.length} ${game.guesses.length === 1 ? "guess" : "guesses"} · ` : `It was ${chapter} · `) + `next in ${until}`
        : started ? `${GUESSES - game.guesses.length} of ${GUESSES} guesses left` : "";

    return <>
        <Link href="/play/today" className="ui-button ui-primary h-12 w-full max-w-[18rem] !rounded-full text-[15px]">
            <Icon className="size-[18px]" strokeWidth={2}/>{label}
        </Link>
        <p aria-live="polite" className={`h-5 text-[13px] tabular-nums text-ui-faint transition-opacity duration-500 ${status ? "opacity-100" : "opacity-0"}`}>{status}</p>
    </>;
}
