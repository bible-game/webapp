"use client"

import React from "react";
import moment from "moment";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { I18nProvider } from "@react-aria/i18n";
import {
    Avatar,
    DatePicker,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    useDisclosure,
} from "@heroui/react";
import { Button } from "@heroui/button";
import { getLocalTimeZone, parseDate, today as TODAY } from "@internationalized/date";
import {
    BookOpenIcon,
    CalendarDaysIcon,
    ChartColumnIcon,
    LightbulbIcon,
    MenuIcon,
    PlayIcon,
    ShieldAlertIcon,
    UserRoundIcon,
    XIcon,
} from "lucide-react";
import { logOut } from "@/core/action/auth/log-out";

const iconButton = "h-12 w-12 min-w-0 rounded-none bg-transparent p-0 text-[#ffffff] data-[hover=true]:!bg-[#ffffff0d]";

const links = [
    { key: "play", label: "Play", href: "/play/today", icon: PlayIcon },
    { key: "read", label: "Read", href: "/read", icon: BookOpenIcon },
    { key: "study", label: "Study", href: "/study", icon: LightbulbIcon },
    { key: "stats", label: "Statistics", href: "/stats", icon: ChartColumnIcon },
];

/**
 * Play Header Component: menu, game date and account
 * @since 2nd October 2026
 */
const Header = (props: any) => {
    const drawer = useDisclosure();

    function changeDate(date: string): void {
        redirect(`/play/${date}`);
    }

    return (
        <header className="flex h-12 shrink-0 items-center justify-between px-1">
            <Button isIconOnly disableRipple aria-label="Open menu" className={iconButton} onPress={drawer.onOpen}>
                <MenuIcon className="size-6"/>
            </Button>

            <div className="relative flex h-12 items-center gap-3 px-2 text-[14px] font-light tracking-[0.08em] text-[#bfbfbf]">
                <CalendarDaysIcon className="size-4 text-[#ffffff]"/>
                <span>{moment(props.date).format("DD/MM/YYYY")}</span>
                {props.date == "today" ? null :
                    <I18nProvider locale="en-GB">
                        {/* invisible picker laid over the date, so tapping it opens the calendar */}
                        <DatePicker
                            aria-label="Choose a date"
                            className="!absolute inset-0 !w-full opacity-0"
                            popoverProps={{ classNames: { content: "dark rounded-xl bg-[#0d0e0f] p-0" } }}
                            calendarProps={{ classNames: {
                                base: "dark bg-[#0d0e0f] text-[#dfdfdf] rounded-xl",
                                headerWrapper: "bg-[#0d0e0f]",
                                gridHeader: "bg-[#0d0e0f] shadow-none",
                                gridWrapper: "bg-[#0d0e0f]",
                                cellButton: "data-[selected=true]:!bg-[#ffffff] data-[selected=true]:!text-[#000000]",
                            } }}
                            classNames={{
                                inputWrapper: "!h-full w-full p-0",
                                selectorButton: "!absolute inset-0 !h-full !w-full",
                                input: "hidden",
                            }}
                            value={parseDate(props.date) as any}
                            maxValue={parseDate(TODAY(getLocalTimeZone()).toString()) as any}
                            onChange={(value: any) => changeDate(`${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`)}/>
                    </I18nProvider>
                }
            </div>

            <div className="flex h-12 w-12 items-center justify-center">
                {props.info ?
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar as="button" className="size-8 bg-[#cac4d0] text-[12px] font-bold text-[#000000]"
                                    name={props.info.firstname[0].toUpperCase() + props.info.lastname[0].toUpperCase()}/>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Account" variant="flat">
                            <DropdownItem key="logout" color="danger" className="text-black"
                                          onPress={() => logOut().then(() => window.location.reload())}>Log Out</DropdownItem>
                        </DropdownMenu>
                    </Dropdown> :
                    <Link href="/account/log-in" aria-label="Log in to keep your progress safe"
                          className="relative flex h-12 w-12 items-center justify-center text-[#ffffff]">
                        <UserRoundIcon className="size-6" fill="currentColor"/>
                        <ShieldAlertIcon className="absolute bottom-2.5 right-2.5 size-3.5 text-[#000000]" fill="#edb542"
                                         strokeWidth={2.5}/>
                    </Link>
                }
            </div>

            <Drawer isOpen={drawer.isOpen} onOpenChange={drawer.onOpenChange} placement="left" size="full"
                    radius="none" hideCloseButton
                    classNames={{ base: "bg-[#000000] text-[#dfdfdf] [font-family:Inter,system-ui,sans-serif]" }}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="relative flex h-[72px] items-center justify-between px-3 pb-0 pt-[env(safe-area-inset-top)]">
                                <Link href="/" aria-label="Bible Game home">
                                    <Image src="/icon-bright.png" alt="" width={46} height={46}/>
                                </Link>
                                <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-light uppercase tracking-[0.18em] text-[#bfbfbf]">
                                    Bible Game
                                </span>
                                <Button isIconOnly disableRipple aria-label="Close menu" className={iconButton} onPress={onClose}>
                                    <XIcon className="size-6" strokeWidth={3}/>
                                </Button>
                            </DrawerHeader>
                            <DrawerBody className="items-center pt-5">
                                <nav className="grid gap-y-1 text-[14px] font-light leading-[23px]">
                                    {links.map(({ key, label, href, icon: Icon }) =>
                                        key == "play" ?
                                            <span key={key} aria-current="page"
                                                  className="grid grid-cols-[1.25rem_1fr] items-center gap-x-9 py-[5px] text-[#999999]">
                                                <Icon className="size-4 text-[#dfdfdf]"/>{label}
                                            </span> :
                                            <Link key={key} href={href}
                                                  className="grid grid-cols-[1.25rem_1fr] items-center gap-x-9 py-[5px] text-[#dfdfdf] hover:text-[#ffffff]">
                                                <Icon className="size-4"/>{label}
                                            </Link>
                                    )}
                                </nav>
                            </DrawerBody>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </header>
    );
}

export default Header;
