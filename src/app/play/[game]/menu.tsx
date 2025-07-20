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
import { Code, Spinner, useDisclosure } from "@heroui/react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import Image from "next/image";
import getVersion from "@/core/action/version/get-version";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Menu = (props: any) => {
    const date = parseDate(props.date);
    const { data, error, isLoading } = useSWR(`${process.env.SVC_PASSAGE}/daily/history`, fetcher);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    let version: string;
    getVersion().then((appVersion) => version = appVersion);

    // const tooltip = <div className="px-1 py-2">
    //     <div className="text-small font-bold">{props.passage.icon} {themeMap[props.passage.icon].name}</div>
    //     <div className="text-tiny">{themeMap[props.passage.icon].description}</div>
    // </div>

    const stylesDateInput = {
        base: ["w-min", "mb-2", props.device == 'mobile' ? "mt-2" : ""],
        selectorButton: ["opacity-85", "text-white", "p-[1.5rem]", "sm:p-[1.0625rem]", "hover:!bg-[#ffffff14]"],
        inputWrapper: ["dark", "!bg-transparent"],
        input: ["opacity-85", "ml-2", "text-xs", props.device == 'mobile' ? "hidden" : ""]
    };

    function changeDate(date: string = _.sample(data)): void {
        redirect(`/play/${date.split("T")[0]}`);
    }

    if (isLoading) return <></>
    else return <section>
        <div className="ml-4 sm:ml-6 flex gap-4 sm:gap-1 items-start justify-between">
            <div className="flex gap-1 items-start">
                <Button variant="light"
                        radius="full"
                        size={props.device == 'mobile' ? 'lg' : 'sm'}
                        isIconOnly
                        onPress={onOpen}
                        className="mt-1 text-white hover:!bg-[#ffffff14] opacity-75 text-sm mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>
                    </svg>
                </Button>
                <Button variant="light"
                        radius="full"
                        size={props.device == 'mobile' ? 'lg' : 'sm'}
                        isIconOnly
                        onPress={() => changeDate()}
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
                {/*{*/}
                {/*    props.device == "mobile" ? <></> :*/}
                {/*}*/}
                <Modal
                    backdrop="opaque"
                    classNames={{
                        body: "p-8 text-center",
                        backdrop: "bg-[#060842]/75",
                        base: "max-w-[40rem] h-min bg-gradient-to-t from-[#0f0a31] to-[#060842] border-[1px] border-[#ffffff]/25",
                        header: "pt-8 w-full text-center",
                        closeButton: "hover:bg-white/5 active:bg-white/10 absolute right-6 top-6",
                    }}
                    isOpen={isOpen}
                    radius="lg"
                    placement="center"
                    onOpenChange={onOpenChange}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">How to Play</ModalHeader>
                                <ModalBody>
                                    {/*<p className="p-1 font-extralight">Each chapter has been assigned a theme</p>*/}
                                    {/*<div className="flex gap-8 mb-6 justify-center">*/}
                                    {/*    {*/}
                                    {/*        Object.keys(themeMap).map(function (theme: string, i: number) {*/}
                                    {/*            return <div key={themeMap[theme].name}>*/}
                                    {/*                <Tooltip placement="bottom" content={themeMap[theme].name}*/}
                                    {/*                         classNames={{content: ["text-white max-w-[20rem] bg-[#0f0a31]"]}}>*/}
                                    {/*                    <span className="cursor-pointer">{theme}</span>*/}
                                    {/*                </Tooltip>*/}
                                    {/*            </div>*/}
                                    {/*        })*/}
                                    {/*    }*/}
                                    {/*</div>*/}
                                    <p className="p-1 font-extralight">A chapter is randomly selected and summarised</p>
                                    <div className="mb-6">
                                        <Code color="success" size="sm" radius="lg">Acts 3</Code> &#8594; <Code
                                        color="success" size="sm" radius="lg">Peter heals a lame man in faith</Code>
                                    </div>
                                    {/*<p className="p-1 font-extralight">Click the map to choose chapters with today&apos;s theme</p>*/}
                                    <p className="p-1 font-extralight">Click the map to select a chapter</p>
                                    <div className="flex mb-6 justify-center">
                                        <Image src="/mark-1.png" alt="mark1" width={30 * 16} height={0} className="rounded"/>
                                    </div>
                                    <p className="p-1 font-extralight">Use the number of verses to narrow your guess</p>
                                    <div className="flex mb-6 justify-center">
                                        <Image src="/guesses.png" alt="guesses" width={40 * 16} height={0}/>
                                    </div>
                                    <div className="mx-auto">
                                        <p>App version: { version }</p>
                                    </div>
                                </ModalBody>
                            </>
                            )}
                    </ModalContent>
                </Modal>
            </div>
        </div>
        <div
            className={"sm:panel p-1 sm:p-4 sm:h-[66px] " + (!props.playing ? "flex justify-between gap-2 px-6" : "text-center")}>
            <div className={"opacity-80 " + (!props.playing ? "ml-2" : "")}>️️️
                {/*<Tooltip showArrow={true} content={tooltip} classNames={{content: ["text-white max-w-[20rem] bg-gradient-to-t from-[#0f0a31] to-[#060842]"]}}>*/}
                {/*    <span className="mr-4 cursor-pointer">{props.passage.icon}️</span>*/}
                {/*</Tooltip>*/}
                {props.passage.summary}
            </div>
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

const themeMap: any = {
    '📖': {
        name: 'History',
        description: 'Narrative-focused chapters telling stories, biographies, events, or genealogies'
    },
    '💔': {
        name: 'Sin',
        description: 'Chapters emphasizing human failure, rebellion, judgment, hypocrisy, or moral failure'
    },
    '✝️': {
        name: 'Gospel',
        description: 'Chapters focused on Jesus’ identity, mission, and the message of salvation by grace through faith'
    },
    '✨': {
        name: 'Prophecy',
        description: 'Divine messages, often foretelling future events, including apocalyptic visions and eschatological themes'
    },
    '🧠': {
        name: 'Wisdom',
        description: 'Reflective or philosophical chapters offering life advice, ethical reflection, or theological insight that is more meditative than commanding'
    },
    '🙏': {
        name: 'Worship',
        description: 'Chapters centered on praise, prayer, devotion, and liturgical expressions'
    },
    '⚖️': {
        name: 'Instruction',
        description: 'Rule-based chapters giving practical commands or ethical guidelines for living, worship, leadership, and community behavior'
    },
    '☀️': {
        name: 'Hope',
        description: 'Encouraging chapters that offer comfort, restoration, victory, and assurance of God’s faithfulness and future glory'
    }
};