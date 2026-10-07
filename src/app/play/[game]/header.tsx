"use client"

import React from "react";
import moment from "moment";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
    Avatar,
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
import DatePicker from "@/app/play/[game]/date-picker";
import {
    BookOpenIcon,
    ChartColumnIcon,
    LightbulbIcon,
    MenuIcon,
    PlayIcon,
    UserRoundIcon,
    XIcon,
} from "lucide-react";
import { logOut } from "@/core/action/auth/log-out";

const iconButton = "h-11 w-11 min-w-0 rounded-full bg-transparent p-0 text-play-text data-[hover=true]:!bg-play-raised data-[pressed=true]:!bg-play-raised";

const links = [
    { key: "play", label: "Play", href: "/play/today", icon: PlayIcon },
    { key: "read", label: "Read", href: "/read", icon: BookOpenIcon },
    { key: "study", label: "Study", href: "/study", icon: LightbulbIcon },
    { key: "stats", label: "Statistics", href: "/stats", icon: ChartColumnIcon },
];

/** "Today", or e.g. "Sat 4 Oct" (with the year when it isn't this year) */
function formatDate(date: string): string {
    const day = moment(date);
    if (date == "today" || day.isSame(moment(), "day")) return "Today";
    return day.format(day.isSame(moment(), "year") ? "ddd D MMM" : "ddd D MMM YYYY");
}

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
        <header className="flex h-14 shrink-0 items-center justify-between px-2">
            <Button isIconOnly disableRipple aria-label="Open menu" className={iconButton} onPress={drawer.onOpen}>
                <MenuIcon className="size-6"/>
            </Button>

            <DatePicker date={props.date} label={formatDate(props.date)} onChange={changeDate}/>

            <div className="flex h-11 w-11 items-center justify-center">
                {props.info ?
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar as="button" aria-label="Open account menu" className="size-8 bg-play-raised text-[12px] font-semibold text-play-text ring-1 ring-play-line"
                                    name={props.info.firstname[0].toUpperCase() + props.info.lastname[0].toUpperCase()}/>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Account" variant="flat" className="play-ui bg-play-surface text-play-text">
                            <DropdownItem key="logout" color="danger" className="text-play-text"
                                          onPress={() => logOut().then(() => window.location.reload())}>Log Out</DropdownItem>
                        </DropdownMenu>
                    </Dropdown> :
                    <Link href="/account/log-in" aria-label="Log in to save your progress"
                          className="relative flex h-11 w-11 items-center justify-center rounded-full text-play-text hover:bg-play-raised">
                        <UserRoundIcon className="size-6" strokeWidth={1.75}/>
                        <span aria-hidden="true"
                              className="absolute right-2 top-2 size-2.5 rounded-full bg-play-accent ring-2 ring-play-bg"/>
                    </Link>
                }
            </div>

            <Drawer isOpen={drawer.isOpen} onOpenChange={drawer.onOpenChange} placement="left" size="full"
                    radius="none" hideCloseButton
                    classNames={{ base: "play-ui bg-play-bg text-play-text" }}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="relative flex h-[72px] items-center justify-between px-3 pb-0 pt-[env(safe-area-inset-top)]">
                                <Link href="/" aria-label="Bible Game home">
                                    <Image src="/icon-bright.png" alt="" width={46} height={46}/>
                                </Link>
                                <span className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-play-text">
                                    Bible Game
                                </span>
                                <Button isIconOnly disableRipple aria-label="Close menu" className={iconButton} onPress={onClose}>
                                    <XIcon className="size-6" strokeWidth={2}/>
                                </Button>
                            </DrawerHeader>
                            <DrawerBody className="items-center pt-5">
                                <nav className="grid w-full max-w-[18rem] gap-y-1 text-[16px] font-medium">
                                    {links.map(({ key, label, href, icon: Icon }) =>
                                        key == "play" ?
                                            <span key={key} aria-current="page"
                                                  className="flex h-12 items-center gap-x-4 rounded-lg bg-play-surface px-4 text-play-text">
                                                <Icon className="size-5 text-play-accent"/>{label}
                                            </span> :
                                            <Link key={key} href={href}
                                                  className="flex h-12 items-center gap-x-4 rounded-lg px-4 text-play-muted hover:bg-play-surface hover:text-play-text">
                                                <Icon className="size-5"/>{label}
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
