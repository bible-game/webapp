"use client"

import React from "react";
import { Button } from "@nextui-org/react";
import { DatePicker } from "@heroui/date-picker";
import { getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";
import { Chip } from "@nextui-org/chip";
import _ from "lodash";
import { redirect } from "next/navigation";
import useSWR from "swr";
import { I18nProvider } from "@react-aria/i18n";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Menu = (props: any) => {
    const date = parseDate(props.date);
    const { data, error, isLoading } = useSWR(`${process.env.SVC_PASSAGE}/daily/history`, fetcher)

    const stylesDateInput = {
        base: ["w-min", "mb-2"],
        selectorButton: ["opacity-85", "text-white", "p-[1.0625rem]", "hover:!bg-[#ffffff14]"],
        inputWrapper: ["dark", "!bg-transparent"],
        input: ["opacity-85", "ml-2", "text-xs"]
    };

    function changeDate(date: string = _.sample(data)): void {
        redirect(`/play/${date.split("T")[0]}`);
    }

    if (isLoading) return <div>Loading...</div>
    else return <section>
        <div className="ml-6 flex gap-1 items-start justify-between">
            <div className="flex gap-1 items-start">
                <Button variant="light"
                        radius="full"
                        size="sm"
                        isIconOnly
                        onClick={() => changeDate()}
                        className="mt-1 text-white hover:!bg-[#ffffff14] opacity-85">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                    </svg>
                </Button>
                <I18nProvider locale="en-GB">
                    <DatePicker
                        classNames={stylesDateInput}
                        defaultValue={date as any}
                        maxValue={parseDate(TODAY(getLocalTimeZone()).toString()) as any}
                        value={date as any}
                        onChange={(value: any) => changeDate(`${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`)}
                        selectorButtonPlacement="start"/>
                </I18nProvider>
            </div>
        </div>
        <div
            className={"panel p-4 h-[66px] " + (!props.playing ? "flex justify-between gap-2 px-6" : "text-center")}>
            <div className={"opacity-80 " + (!props.playing ? "ml-2" : "")}>{props.passage.summary}</div>
            <Chip size="sm"
                  variant="solid"
                  classNames={{
                      base: `opacity-90 bg-gradient-to-br from-green-100 to-green-300 border border-white/50 h-7 mt-0.5 ${props.playing ? "hidden" : ""}`,
                      content: "text-black font-medium px-2 py-1 tracking-wide text-center text-[11px]"
                  }}>
                {props.passage.book + " " + props.passage.chapter}</Chip>
        </div>
    </section>
}

export default Menu;