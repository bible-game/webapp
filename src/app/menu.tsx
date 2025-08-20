"use client"

import React from "react";
import { I18nProvider } from "@react-aria/i18n";
import _ from "lodash";
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Avatar,
    Dropdown,
    DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure,
    Modal,
    ModalContent,
    ModalBody, DatePicker
} from "@heroui/react";
import { Button } from "@heroui/button";
import {
    BarChart, CircleQuestionMark,
    ArrowLeftIcon,
    LightbulbIcon, LogInIcon,
    MapIcon,
    MenuIcon,
    NotebookIcon,
    PlayIcon, RefreshCwIcon,
} from "lucide-react";
import { SiGithub, SiDiscord } from '@icons-pack/react-simple-icons';
import {redirect} from "next/navigation";
import getVersion from "@/core/action/version/get-version";
import useSWR from "swr";
import { getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";
import { Code } from "@heroui/code";
import { ModalHeader } from "@heroui/modal";
import Link from "next/link";
import Image from "next/image";
import { logOut } from "@/core/action/auth/log-out";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Menu(props: any) {

    const text = props.dark ? "text-black" : "text-white";

    const icons = {
        home: <ArrowLeftIcon fill="currentColor" size={24} />,
        play: <PlayIcon fill="currentColor" size={24} />,
        read: <NotebookIcon fill="currentColor" size={24} />,
        study: <LightbulbIcon fill="currentColor" size={24} />,
        statistics: <BarChart fill="currentColor" size={24} />
    };

    const { data, error, isLoading } = useSWR(`${process.env.SVC_PASSAGE}/daily/history`, fetcher);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    let version: string;
    // getVersion().then((appVersion) => version = appVersion); // fixme :: login redirect err

    const stylesDateInput = {
        base: ["w-min", "mb-2", props.device == 'mobile' ? "mt-2" : "mt-1.5"],
        selectorButton: ["opacity-85", text, "p-[1.5rem]", "sm:p-[1.0625rem]", "hover:!bg-[#ffffff14]"],
        inputWrapper: ["dark", "!bg-transparent"],
        input: ["opacity-85", "ml-2", "text-xs", props.device == 'mobile' ? "hidden" : ""]
    };

    function changeDate(date: string = _.sample(data)): void {
        redirect(`/play/${date.split("T")[0]}`);
    }

    if (isLoading) return <></>
    else return <Navbar className="w-full sm:w-[48rem] bg-transparent backdrop-saturate-100 h-12">
            <NavbarContent justify="start">
                <Dropdown placement="bottom-start">
                    <NavbarItem>
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                className={"p-0 bg-transparent data-[hover=true]:bg-transparent "+text+"/80"}
                                radius="sm"
                                isIconOnly
                                variant="light">
                                <MenuIcon className="h-5 w-5"/>
                            </Button>
                        </DropdownTrigger>
                    </NavbarItem>
                    <DropdownMenu
                        aria-label="menu"
                        itemClasses={{
                            base: "gap-4 !text-back",
                        }}>
                        {props.isLanding ? <></> : <DropdownItem key="home" startContent={icons.home} className="text-gray-900" href="/">Back</DropdownItem>}
                        <DropdownItem key="play" startContent={icons.play} className="text-gray-900" href="/play/today">Play</DropdownItem>
                        <DropdownItem key="read" startContent={icons.read} className="text-gray-900" href="/read">Read</DropdownItem>
                        <DropdownItem key="study" startContent={icons.study} className="text-gray-900" href="/study">Study</DropdownItem>
                        <DropdownItem key="statistics" startContent={icons.statistics} className="text-gray-900" href="/stats">Statistics</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </NavbarContent>
            { props.isLanding ? <NavbarContent justify="center">
                <NavbarItem>
                    <Image src="/icon-nobg.png" alt="logo" width={36} height={36} />
                </NavbarItem>
            </NavbarContent> : <></> }
            {props.isStats ? <NavbarContent justify="center">
                <NavbarItem>
                    <Button variant="light"
                            radius="full"
                            size={props.device == 'mobile' ? 'lg' : 'sm'}
                            isIconOnly
                            as={Link}
                            href="https://discord.gg/6ZJYbQcph5"
                            target="_blank"
                            onPress={onOpen}
                            className="-mt-0.5 text-white hover:!bg-[#ffffff14] opacity-75 text-sm mr-1">
                        <SiDiscord className="h-4 w-4"/>
                    </Button>
                </NavbarItem>
                <NavbarItem>
                    <Button variant="light"
                            radius="full"
                            size={props.device == 'mobile' ? 'lg' : 'sm'}
                            isIconOnly
                            as={Link}
                            href="https://github.com/bible-game"
                            onPress={onOpen}
                            className="-mt-0.5 text-white hover:!bg-[#ffffff14] opacity-75 text-sm mr-1">
                        <SiGithub className="h-4 w-4"/>
                    </Button>
                </NavbarItem>
            </NavbarContent> : <></>}
            {props.isPlay ? <NavbarContent justify="center">
                <NavbarItem>
                    <Button variant="light"
                        radius="full"
                        size={props.device == 'mobile' ? 'lg' : 'sm'}
                        isIconOnly
                        onPress={onOpen}
                        className="-mt-0.5 text-white hover:!bg-[#ffffff14] opacity-75 text-sm mr-1">
                        <CircleQuestionMark className="h-4 w-4"/>
                    </Button>
                </NavbarItem>
                <NavbarItem className="flex items-center">
                    <Button variant="light"
                            radius="full"
                            size={props.device == 'mobile' ? 'lg' : 'sm'}
                            isIconOnly
                            onPress={() => props.toggleNarrative()}
                            className="-mt-0.5 text-white hover:!bg-[#ffffff14] opacity-85">
                        <MapIcon className="h-4 w-4"/>
                    </Button>
                </NavbarItem>
                <NavbarItem>
                    <Button variant="light"
                            radius="full"
                            size={props.device == 'mobile' ? 'lg' : 'sm'}
                            isIconOnly
                            onPress={() => changeDate()}
                            className="-mt-0.5 text-white hover:!bg-[#ffffff14] opacity-85">
                        <RefreshCwIcon className="h-4 w-4"/>
                    </Button>
                </NavbarItem>
                {
                    props.date == "today" ? <></> :
                    <NavbarItem>
                        <I18nProvider locale="en-GB">
                            <DatePicker
                                classNames={stylesDateInput}
                                defaultValue={parseDate(props.date) as any}
                                maxValue={parseDate(TODAY(getLocalTimeZone()).toString()) as any}
                                value={parseDate(props.date) as any}
                                onChange={(value: any) => changeDate(`${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`)}
                                selectorButtonPlacement="start"/>
                        </I18nProvider>
                    </NavbarItem>
                }
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
                    onOpenChange={onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">How to Play</ModalHeader>
                                <ModalBody>
                                    <p className="p-1 font-extralight">A chapter is randomly selected and summarised</p>
                                    <div className="mb-6">
                                        <Code color="success" size="sm" radius="lg">Acts 3</Code> &#8594; <Code
                                        color="success" size="sm" radius="lg">Peter heals a lame man in faith</Code>
                                    </div>
                                    <p className="p-1 font-extralight">Click the map to select a chapter</p>
                                    <div className="flex mb-6 justify-center">
                                        {/*<Image src="/mark-1.png" alt="mark1" width={30 * 16} height={0} className="rounded"/>*/}
                                    </div>
                                    <p className="p-1 font-extralight">Use the number of verses to narrow your guess</p>
                                    <div className="flex mb-6 justify-center">
                                        {/*<Image src="/guesses.png" alt="guesses" width={40 * 16} height={0}/>*/}
                                    </div>
                                    <div className="mx-auto">
                                        {/*<p>App version: { version }</p>*/}
                                    </div>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </NavbarContent> : <></>}
            <NavbarContent justify="end">
                <NavbarItem>
                    {props.info ?
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Avatar isBordered as="button" name={props.info.firstname[0].toUpperCase()+props.info.lastname[0].toUpperCase()} size="sm"/>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Profile Actions" variant="flat">
                                <DropdownItem key="logout" color="danger" className="text-black" onPress={() => {logOut().then(() => window.location.reload())}}>Log Out</DropdownItem>
                            </DropdownMenu>
                        </Dropdown> :
                        <Link href="/account/log-in" className="flex gap-2">
                            <LogInIcon className="h-4 w-4"/>
                            <p className={"font-light text-xs " + text}>Login</p>
                        </Link>
                    }
                </NavbarItem>
            </NavbarContent>
        </Navbar>
}