"use client"

import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import useSWR from "swr";
import { Modal, ModalBody, ModalContent } from "@heroui/react";
import { Button } from "@heroui/button";
import { CalendarDaysIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { StateUtil } from "@/core/util/state-util";
import { GameState } from "@/core/model/state/game-state";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Status = "won" | "lost" | "started";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const FORMAT = "YYYY-MM-DD";

/** Colours of each day status: green completed (won), red lost, amber started */
const statusStyle: Record<Status, string> = {
    won: "bg-play-won/25 text-play-won ring-1 ring-play-won/60",
    lost: "bg-play-lost/25 text-play-lost ring-1 ring-play-lost/60",
    started: "bg-play-amber/25 text-play-amber ring-1 ring-play-amber/60",
};

function statusOf(state?: GameState): Status | undefined {
    if (!state || !state.guesses?.length) return undefined;
    if (state.playing) return "started";
    return state.stars > 0 ? "won" : "lost";
}

/**
 * Date Picker: a chip showing the game date, opening a large touch-friendly calendar
 * with days coloured by progress (started / completed / lost)
 * @since 7th October 2026
 */
const DatePicker = (props: { date: string, label: string, onChange: (date: string) => void }) => {
    const [open, setOpen] = useState(false);
    const selected = props.date == "today" ? moment() : moment(props.date, FORMAT);
    const [month, setMonth] = useState(selected.clone().startOf("month"));
    const [games, setGames] = useState(new Map<number, GameState>());
    const { data: calendar } = useSWR<Record<string, number>>(open ? `${process.env.SVC_PASSAGE}/daily/calendar` : null, fetcher);

    useEffect(() => {
        if (!open) return;
        setMonth(selected.clone().startOf("month"));
        setGames(StateUtil.getAllGames());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const today = moment().startOf("day");

    const cells = useMemo(() => {
        const lead = month.isoWeekday() - 1; // Monday-first leading blanks
        const days = month.daysInMonth();
        return [
            ...Array(lead).fill(null),
            ...Array.from({ length: days }, (_, i) => month.clone().date(i + 1))
        ];
    }, [month]);

    const canGoForward = month.clone().add(1, "month").isSameOrBefore(today, "month");

    function pick(day: moment.Moment) {
        setOpen(false);
        props.onChange(day.format(FORMAT));
    }

    return (
        <>
            <button type="button" aria-label="Choose a date" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}
                    className="flex h-9 items-center gap-2 rounded-full border border-play-line bg-play-surface pl-3 pr-2.5 text-[14px] font-medium tabular-nums text-play-text">
                <CalendarDaysIcon className="size-4 text-play-muted" aria-hidden="true"/>
                <span>{props.label}</span>
                <ChevronDownIcon className="size-4 text-play-muted" aria-hidden="true"/>
            </button>

            <Modal isOpen={open} onOpenChange={setOpen} placement="bottom" backdrop="blur" hideCloseButton
                   aria-label="Choose a game date"
                   classNames={{ base: "play-ui dark m-0 w-full max-w-[28rem] rounded-b-none rounded-t-3xl border border-play-line bg-play-surface text-play-text sm:m-auto sm:rounded-3xl" }}>
                <ModalContent>
                    <ModalBody className="gap-3 px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                        <div className="flex items-center justify-between">
                            <Button isIconOnly disableRipple aria-label="Previous month"
                                    className="h-12 w-12 min-w-0 rounded-full bg-transparent text-play-text data-[pressed=true]:!bg-play-raised"
                                    onPress={() => setMonth(month.clone().subtract(1, "month"))}>
                                <ChevronLeftIcon className="size-6"/>
                            </Button>
                            <span className="text-[17px] font-semibold">{month.format("MMMM YYYY")}</span>
                            <Button isIconOnly disableRipple aria-label="Next month" isDisabled={!canGoForward}
                                    className="h-12 w-12 min-w-0 rounded-full bg-transparent text-play-text data-[pressed=true]:!bg-play-raised"
                                    onPress={() => setMonth(month.clone().add(1, "month"))}>
                                <ChevronRightIcon className="size-6"/>
                            </Button>
                        </div>

                        <div className="grid grid-cols-7 gap-1.5 text-center">
                            {WEEKDAYS.map((day, i) =>
                                <span key={i} className="pb-1 text-[12px] font-medium uppercase text-play-faint">{day}</span>)}
                            {cells.map((day, i) => {
                                if (!day) return <span key={`blank-${i}`}/>;
                                const key = day.format(FORMAT);
                                const future = day.isAfter(today, "day");
                                const status = statusOf(calendar?.[key] != null ? games.get(calendar[key]) : undefined);
                                const current = day.isSame(selected, "day");
                                return (
                                    <button key={key} type="button" disabled={future}
                                            aria-label={`${day.format("dddd D MMMM")}${status ? `, ${status == "won" ? "completed" : status}` : ""}`}
                                            aria-current={current ? "date" : undefined}
                                            onClick={() => pick(day)}
                                            className={`flex aspect-square min-h-12 items-center justify-center rounded-full text-[16px] font-medium tabular-nums
                                                ${future ? "text-play-faint/40" : status ? statusStyle[status] : "text-play-text active:bg-play-raised"}
                                                ${current ? "!bg-play-text !text-play-bg !ring-0" : ""}
                                                ${!current && day.isSame(today, "day") ? "outline outline-1 outline-play-muted" : ""}`}>
                                        {day.date()}
                                    </button>
                                );
                            })}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export default DatePicker;
