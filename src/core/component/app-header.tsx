"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { BookOpenIcon, ChartColumnIcon, LightbulbIcon, MenuIcon, PlayIcon, UserRoundIcon, XIcon } from "lucide-react";
import { logOut } from "@/core/action/auth/log-out";

export type AppHeaderProps = {
    info?: { firstname: string; lastname: string };
    children?: React.ReactNode;
};

const iconButton = "h-11 w-11 min-w-0 rounded-full bg-transparent p-0 text-ui-text data-[hover=true]:!bg-ui-raised data-[pressed=true]:!bg-ui-raised";
const links = [
    { label: "Play", href: "/play/today", prefix: "/play", icon: PlayIcon },
    { label: "Read", href: "/read", prefix: "/read", icon: BookOpenIcon },
    { label: "Study", href: "/study", prefix: "/study", icon: LightbulbIcon },
    { label: "Statistics", href: "/stats", prefix: "/stats", icon: ChartColumnIcon },
];

export default function AppHeader({ info, children }: AppHeaderProps) {
    const drawer = useDisclosure();
    const pathname = usePathname();

    return (
        <header className="flex h-14 shrink-0 items-center justify-between px-2 text-ui-text">
            <Button isIconOnly disableRipple aria-label="Open menu" title="Open menu" className={iconButton} onPress={drawer.onOpen}>
                <MenuIcon className="size-6"/>
            </Button>
            {children ?? <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-full" aria-label="Bible Game home" title="Bible Game">
                <Image src="/icon-bright.png" alt="" width={30} height={30}/>
            </Link>}
            <div className="flex h-11 w-11 items-center justify-center">
                {info ? <Dropdown placement="bottom-end" classNames={{ content: "rounded-lg bg-ui-surface border border-ui-line text-ui-text" }}>
                    <DropdownTrigger>
                        <Avatar as="button" aria-label="Open account menu" className="size-8 bg-ui-raised text-[12px] font-semibold text-ui-text ring-1 ring-ui-line"
                                name={(info.firstname[0] ?? "").toUpperCase() + (info.lastname[0] ?? "").toUpperCase()}/>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Account" variant="flat">
                        <DropdownItem key="logout" color="danger" className="text-ui-text" onPress={() => logOut().then(() => window.location.reload())}>Log Out</DropdownItem>
                    </DropdownMenu>
                </Dropdown> : <Link href="/account/log-in" aria-label="Log in to save your progress" title="Log in"
                                   className="relative flex h-11 w-11 items-center justify-center rounded-full text-ui-text hover:bg-ui-raised">
                    <UserRoundIcon className="size-6" strokeWidth={1.75}/>
                    <span aria-hidden="true" className="absolute right-2 top-2 size-2.5 rounded-full bg-ui-accent ring-2 ring-ui-bg"/>
                </Link>}
            </div>
            <Drawer isOpen={drawer.isOpen} onOpenChange={drawer.onOpenChange} placement="left" size="full" radius="none" hideCloseButton
                    classNames={{ base: "play-ui bg-ui-bg text-ui-text" }}>
                <DrawerContent>{onClose => <>
                    <DrawerHeader className="relative flex h-[72px] items-center justify-between px-3 pb-0 pt-[env(safe-area-inset-top)]">
                        <Link href="/" aria-label="Bible Game home" onClick={onClose}><Image src="/icon-bright.png" alt="" width={46} height={46}/></Link>
                        <span className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold">Bible Game</span>
                        <Button isIconOnly disableRipple aria-label="Close menu" className={iconButton} onPress={onClose}><XIcon className="size-6"/></Button>
                    </DrawerHeader>
                    <DrawerBody className="items-center pt-5">
                        <nav aria-label="Main navigation" className="grid w-full max-w-[18rem] gap-y-1 text-[16px] font-medium">
                            {links.map(({ label, href, prefix, icon: Icon }) => {
                                const active = pathname === prefix || pathname.startsWith(prefix + "/");
                                return <Link key={href} href={href} onClick={onClose} aria-current={active ? "page" : undefined}
                                             className={`flex h-12 items-center gap-x-4 rounded-lg px-4 ${active ? "bg-ui-surface text-ui-text" : "text-ui-muted hover:bg-ui-surface hover:text-ui-text"}`}>
                                    <Icon className={`size-5 ${active ? "text-ui-accent" : ""}`}/>{label}
                                </Link>;
                            })}
                            <div className="mt-5 grid gap-1 border-t border-ui-line pt-4 text-[14px] text-ui-muted">
                                <Link href="/about" onClick={onClose} className="px-4 py-3 hover:text-ui-text">About Bible Game</Link>
                                <Link href="/about/privacy" onClick={onClose} className="px-4 py-3 hover:text-ui-text">Privacy</Link>
                                <Link href="/about/cookies" onClick={onClose} className="px-4 py-3 hover:text-ui-text">Cookies</Link>
                                <div className="flex gap-5 px-4 py-3">
                                    <a href="https://github.com/bible-game" target="_blank" rel="noopener noreferrer" className="hover:text-ui-text">GitHub</a>
                                    <a href="https://discord.gg/6ZJYbQcph5" target="_blank" rel="noopener noreferrer" className="hover:text-ui-text">Discord</a>
                                </div>
                            </div>
                        </nav>
                    </DrawerBody>
                </>}</DrawerContent>
            </Drawer>
        </header>
    );
}
