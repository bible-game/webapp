"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { ArrowRightIcon, BookOpenIcon, ChartColumnIcon, LightbulbIcon, MenuIcon, PlayIcon, UserRoundIcon, XIcon } from "lucide-react";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { logOut } from "@/core/action/auth/log-out";
import { playTheme } from "@/core/style/play-theme";
import LogoMark from "@/core/component/logo-mark";

export type AppHeaderProps = {
    info?: { firstname: string; lastname: string };
    children?: React.ReactNode;
};

const iconButton = "h-11 w-11 min-w-0 rounded-full bg-transparent p-0 text-ui-text data-[hover=true]:!bg-ui-raised data-[pressed=true]:!bg-ui-raised";
// Each destination keeps a division colour from the map, as its identity
const links = [
    { label: "Play", detail: "Today's chapter", href: "/play/today", prefix: "/play", icon: PlayIcon, tone: playTheme.green },
    { label: "Read", detail: "The whole Bible", href: "/read", prefix: "/read", icon: BookOpenIcon, tone: playTheme.teal },
    { label: "Study", detail: "Test what you remember", href: "/study", prefix: "/study", icon: LightbulbIcon, tone: playTheme.purple },
    { label: "Statistics", detail: "Stars, streaks and progress", href: "/stats", prefix: "/stats", icon: ChartColumnIcon, tone: playTheme.gold },
];
const pages = [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/about/privacy" },
    { label: "Cookies", href: "/about/cookies" },
];
const social = [
    { label: "Bible Game on GitHub", href: "https://github.com/bible-game", icon: SiGithub },
    { label: "Bible Game on Discord", href: "https://discord.gg/6ZJYbQcph5", icon: SiDiscord },
];

const initials = (info: NonNullable<AppHeaderProps["info"]>) => (info.firstname[0] ?? "").toUpperCase() + (info.lastname[0] ?? "").toUpperCase();
const rise = (index: number) => ({ animationDelay: `${80 + index * 30}ms` });
const logOutAndReload = () => logOut().then(() => window.location.reload());

export default function AppHeader({ info, children }: AppHeaderProps) {
    const drawer = useDisclosure();
    const pathname = usePathname();

    return (
        <header className="flex h-14 shrink-0 items-center justify-between px-2 text-ui-text">
            <Button isIconOnly disableRipple aria-label="Open menu" title="Open menu" className={iconButton} onPress={drawer.onOpen}>
                <MenuIcon className="size-6"/>
            </Button>
            {children}
            <div className="flex h-11 w-11 items-center justify-center">
                {info ? <Dropdown placement="bottom-end" classNames={{ content: "rounded-lg bg-ui-surface border border-ui-line text-ui-text" }}>
                    <DropdownTrigger>
                        <Avatar as="button" aria-label="Open account menu" className="size-8 bg-ui-raised text-[12px] font-semibold text-ui-text ring-1 ring-ui-line"
                                name={initials(info)}/>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Account" variant="flat">
                        <DropdownItem key="logout" color="danger" className="text-ui-text" onPress={logOutAndReload}>Log Out</DropdownItem>
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
                    <DrawerHeader className="relative flex h-[72px] items-center justify-between px-2 pb-0 pt-[env(safe-area-inset-top)]">
                        <Link href="/" aria-label="Bible Game home" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full">
                            <LogoMark size={30}/>
                        </Link>
                        <span className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold">Bible Game</span>
                        <Button isIconOnly disableRipple aria-label="Close menu" className={iconButton} onPress={onClose}><XIcon className="size-6"/></Button>
                    </DrawerHeader>
                    <DrawerBody className="px-4 pt-4">
                        <nav aria-label="Main navigation" className="grid gap-y-1">
                            {links.map(({ label, detail, href, prefix, icon: Icon, tone }, index) => {
                                const active = pathname === prefix || pathname.startsWith(prefix + "/");
                                return <Link key={href} href={href} onClick={onClose} aria-current={active ? "page" : undefined}
                                             className="drawer-row drawer-link" style={{ "--tone": tone, ...rise(index) } as React.CSSProperties}>
                                    <Icon className="size-5 shrink-0" strokeWidth={1.75}/>
                                    <span className="min-w-0">
                                        <span className="block text-[16px] font-medium leading-tight">{label}</span>
                                        <span className="mt-0.5 block text-[13px] text-ui-muted">{detail}</span>
                                    </span>
                                </Link>;
                            })}
                        </nav>
                    </DrawerBody>
                    <DrawerFooter className="flex-col items-stretch gap-3 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
                        {info ? <div className="drawer-row flex items-center gap-3 rounded-lg border border-ui-line bg-ui-surface p-3" style={rise(links.length)}>
                            <Avatar aria-hidden="true" className="size-9 shrink-0 bg-ui-raised text-[13px] font-semibold text-ui-text ring-1 ring-ui-line" name={initials(info)}/>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[15px] font-medium">{info.firstname} {info.lastname}</span>
                                <span className="block text-[13px] text-ui-muted">Signed in</span>
                            </span>
                            <button type="button" className="ui-button min-h-11 shrink-0" onClick={logOutAndReload}>Log out</button>
                        </div> : <Link href="/account/log-in" onClick={onClose} className="drawer-row flex items-center gap-3 rounded-lg border border-ui-line bg-ui-surface p-3 hover:bg-ui-raised"
                                       style={rise(links.length)}>
                            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-ui-raised ring-1 ring-ui-line">
                                <UserRoundIcon className="size-5" strokeWidth={1.75}/>
                                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-ui-accent ring-2 ring-ui-surface"/>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[15px] font-medium">Log in</span>
                                <span className="block text-[13px] text-ui-muted">Save your progress across devices</span>
                            </span>
                            <ArrowRightIcon className="size-5 text-ui-muted"/>
                        </Link>}
                        <div className="drawer-row flex items-center justify-between border-t border-ui-line pt-2 text-[13px] text-ui-muted" style={rise(links.length + 1)}>
                            <nav aria-label="About Bible Game" className="flex">
                                {pages.map(({ label, href }) => <Link key={href} href={href} onClick={onClose}
                                                                      className="flex min-h-11 items-center px-2 first:pl-0 hover:text-ui-text">{label}</Link>)}
                            </nav>
                            <div className="flex">
                                {social.map(({ label, href, icon: Icon }) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
                                                                               className="flex size-11 items-center justify-center rounded-full hover:bg-ui-raised hover:text-ui-text">
                                    <Icon size={18} color="currentColor"/>
                                </a>)}
                            </div>
                        </div>
                    </DrawerFooter>
                </>}</DrawerContent>
            </Drawer>
        </header>
    );
}
