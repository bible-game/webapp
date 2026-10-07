"use client"

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { ArrowRightIcon, BookOpenIcon, FlameIcon, Gamepad2Icon, StarHalfIcon, UserRoundCheckIcon } from "lucide-react";
import getMyRank from "@/core/action/user/get-my-rank";
import { CompletionUtil } from "@/core/util/completion-util";
import { StateUtil } from "@/core/util/state-util";
import { Star } from "@/app/play/[game]/star";
import { playTheme } from "@/core/style/play-theme";

const GREEN = playTheme.green;
const ORANGE = "#e8955a";

const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
};

/** One figure in the grid: a tinted icon, a serif number and a quiet label */
const Tile = ({ icon, colour, value, label }: { icon: React.ReactNode, colour: string, value: string, label: string }) => (
    <div className="flex items-center gap-3 rounded-2xl bg-play-raised px-3 py-2.5">
        <span className="flex size-5 shrink-0 items-center justify-center" style={{ color: colour }}>{icon}</span>
        <span className="min-w-0 leading-none">
            <span className="block font-clue text-[22px] font-medium text-play-text lining-nums">{value}</span>
            <span className="mt-1 block truncate text-[11px] text-play-muted">{label}</span>
        </span>
    </div>
);

/** The player's own figures, read from the game state kept on this device (rendered only while the popover is open) */
const Figures = ({ bible }: { bible: any }) => {
    const games = Array.from(StateUtil.getAllGames().values()).filter(game => !game.playing);
    const average = games.length ? games.reduce((total, game) => total + game.stars, 0) / games.length : 0;

    return (
        <div className="grid grid-cols-2 gap-2">
            <Tile colour={playTheme.purple} icon={<Gamepad2Icon className="size-5" strokeWidth={1.75}/>} value={String(games.length)} label="games played"/>
            <Tile colour={playTheme.accent} icon={<StarHalfIcon className="size-5" fill="currentColor" fillOpacity={0.25} strokeWidth={1.75}/>} value={average.toFixed(1)} label="average stars"/>
            <Tile colour={playTheme.accent} icon={<Star filled shadow={false} className="!size-5 !text-current"/>} value={String(CompletionUtil.calcStars())} label="total stars"/>
            <Tile colour={ORANGE} icon={<FlameIcon className="size-5" fill="currentColor" fillOpacity={0.25} strokeWidth={1.75}/>} value={String(CompletionUtil.calcStreak())} label="day streak"/>
            <div className="col-span-2">
                <Tile colour={playTheme.teal} icon={<BookOpenIcon className="size-5" fill="currentColor" fillOpacity={0.2} strokeWidth={1.75}/>}
                      value={`${CompletionUtil.calcPercentageCompletion(bible, 1)}%`} label="of the Bible seen"/>
            </div>
        </div>
    );
};

/**
 * The footer's right-hand circle when logged in: a green badge with the player's place (e.g. "1st"), opening a popover
 * with their name, place and figures.
 */
const MyStats = ({ info, bible, className }: { info: { firstname: string, lastname: string }, bible: any, className: string }) => {
    const { data } = useSWR("my-rank", () => getMyRank(), { revalidateOnFocus: false });
    const place = data?.rank;

    return (
        <Popover placement="top-end" offset={12} showArrow classNames={{
            content: "w-[calc(100vw-2rem)] max-w-[20rem] items-stretch rounded-2xl border border-play-line bg-play-surface p-4 text-play-text shadow-xl",
            arrow: "bg-play-surface",
        }}>
            <PopoverTrigger>
                <button type="button" aria-label={place ? `You're ${place}${ordinal(place)} of ${data?.totalPlayers}. Show your statistics` : "Show your statistics"}
                        className={className} style={{ color: GREEN, borderColor: `color-mix(in srgb, ${GREEN} 40%, transparent)` }}>
                    {place ?
                        <span className="flex items-start leading-none">
                            <span className="text-[17px] font-bold tabular-nums">{place}</span>
                            <span className="mt-px text-[10px] font-semibold">{ordinal(place)}</span>
                        </span> :
                        <UserRoundCheckIcon className="size-6" strokeWidth={2}/>
                    }
                </button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 leading-tight">
                            <p className="truncate font-clue text-[22px] font-medium">{info.firstname} {info.lastname}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-play-muted">
                                <span className="size-1.5 rounded-full" style={{ background: GREEN }}/>Logged in
                            </p>
                        </div>
                        {place ?
                            <div className="shrink-0 text-right leading-none" style={{ color: GREEN }}>
                                <p className="font-clue text-[30px] font-medium lining-nums">{place}<sup className="ml-0.5 text-[13px] font-semibold">{ordinal(place)}</sup></p>
                                <p className="mt-1 text-[11px] text-play-muted">of {data?.totalPlayers} players</p>
                            </div> : null
                        }
                    </div>
                    <Figures bible={bible}/>
                    <Link href="/stats" className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-play-muted hover:text-play-text">
                        All statistics<ArrowRightIcon className="size-3.5" strokeWidth={2.25}/>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default MyStats;
