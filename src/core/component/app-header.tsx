"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, useDisclosure } from "@heroui/react";
import { ArrowRightIcon, BookOpenIcon, ChartColumnIcon, FlameIcon, Gamepad2Icon, LightbulbIcon, LogOutIcon, MenuIcon, PlayIcon, StarIcon, UserRoundIcon, XIcon } from "lucide-react";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { logOut } from "@/core/action/auth/log-out";
import LogoMark from "@/core/component/logo-mark";
import { CompletionUtil } from "@/core/util/completion-util";
import { StorageUtil } from "@/core/util/storage-util";

export type AppHeaderProps = {
    info?: { firstname: string; lastname: string };
    children?: React.ReactNode;
};

const iconButton = "h-11 w-11 min-w-0 rounded-lg bg-transparent p-0 text-ui-text data-[hover=true]:!bg-ui-raised data-[pressed=true]:!bg-ui-raised";
const links = [
    { label: "Play", detail: "Build a mental map of scripture", href: "/play/today", prefix: "/play", icon: PlayIcon },
    { label: "Read", detail: "Record your Bible reading", href: "/read", prefix: "/read", icon: BookOpenIcon },
    { label: "Study", detail: "Dive deeper into passage", href: "/study", prefix: "/study", icon: LightbulbIcon },
    { label: "Statistics", detail: "Track your scores over time", href: "/stats", prefix: "/stats", icon: ChartColumnIcon },
];
const pages = [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/about/privacy" },
    { label: "Cookies", href: "/about/cookies" },
];
// Brand marks as the brands draw them (Simple Icons), not outlines
const social = [
    { label: "Bible Game on Discord", href: "https://discord.gg/6ZJYbQcph5", icon: SiDiscord },
    { label: "Bible Game on GitHub", href: "https://github.com/bible-game", icon: SiGithub },
];

// Why log in, shown one at a time in the drawer's log-in panel
const reasons = ["Keep your data secure", "Share data across devices", "Compete on the leaderboard"];
const REASON_MS = 3500;

/** Rotates the reasons like a carousel: each slides out to the left, then the next slides in from the right.
 *  Holds while hovered, and only fades under reduced motion */
function LoginReasons() {
    const [index, setIndex] = useState(0);
    const [held, setHeld] = useState(false);
    const reduce = useReducedMotion();

    useEffect(() => {
        if (held) return;
        const timer = setInterval(() => setIndex(i => (i + 1) % reasons.length), REASON_MS);
        return () => clearInterval(timer);
    }, [held]);

    const travel = reduce ? 0 : 24;
    return <span className="login-reasons" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
        <span className="sr-only">{reasons.join(", ")}</span>
        <AnimatePresence mode="wait" initial={false}>
            <motion.span key={index} aria-hidden="true" className="block truncate"
                         initial={{ x: travel, opacity: 0 }}
                         animate={{ x: 0, opacity: 1, transition: { duration: 0.42, ease: [0.2, 0.7, 0.2, 1] } }}
                         exit={{ x: -travel, opacity: 0, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}>
                {reasons[index]}
            </motion.span>
        </AnimatePresence>
    </span>;
}

type Progress = { stars: number; games: number; streak: number };

function useProgress() {
    const [progress, setProgress] = useState<Progress>();
    const [earned, setEarned] = useState(0);
    const last = useRef<number | undefined>(undefined);

    useEffect(() => {
        const update = () => {
            const stars = CompletionUtil.calcStars();
            if (last.current !== undefined && stars > last.current) setEarned(n => n + 1);
            last.current = stars;
            setProgress({ stars, games: CompletionUtil.calcGames(), streak: CompletionUtil.calcStreak() });
        };
        update();
        window.addEventListener(StorageUtil.CHANGED, update);
        window.addEventListener("storage", update);
        return () => {
            window.removeEventListener(StorageUtil.CHANGED, update);
            window.removeEventListener("storage", update);
        };
    }, []);

    return { progress, earned };
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function StarPill({ info, progress, earned }: { info: NonNullable<AppHeaderProps["info"]>; progress?: Progress; earned: number }) {
    const reduce = useReducedMotion();

    return <span className="flex h-9 items-center gap-1.5 rounded-full bg-ui-raised pl-2.5 pr-1 ring-1 ring-ui-line transition-colors group-data-[hover=true]:bg-ui-light-2 group-data-[pressed=true]:bg-ui-light-2">
        <StarIcon aria-hidden="true" className="size-3.5 shrink-0 text-play-gold" fill="currentColor"/>
        <motion.span key={earned} aria-hidden="true" className="min-w-[1ch] text-[13px] font-semibold tabular-nums text-ui-text"
                     initial={earned && !reduce ? { scale: 1.45, color: "#d4b455" } : false}
                     animate={{ scale: 1, color: "var(--ui-text)", transition: { type: "spring", stiffness: 420, damping: 16 } }}>
            {progress ? compact.format(progress.stars) : ""}
        </motion.span>
        <Avatar aria-hidden="true" className="size-7 bg-ui-sheet text-[11px] font-semibold text-ui-text" name={initials(info)}/>
    </span>;
}

const initials = (info: NonNullable<AppHeaderProps["info"]>) => (info.firstname[0] ?? "").toUpperCase() + (info.lastname[0] ?? "").toUpperCase();
const rise = (index: number) => ({ animationDelay: `${80 + index * 30}ms` });
const logOutAndReload = () => logOut().then(() => window.location.reload());
const summary = (progress?: Progress) => [
    { label: "Stars", value: progress?.stars ?? 0, icon: StarIcon, colour: "text-play-gold" },
    { label: "Streak", value: progress?.streak ?? 0, icon: FlameIcon, colour: "text-ui-orange" },
    { label: "Games", value: progress?.games ?? 0, icon: Gamepad2Icon, colour: "text-ui-text" },
];

export default function AppHeader({ info, children }: AppHeaderProps) {
    const drawer = useDisclosure();
    const pathname = usePathname();
    const { progress, earned } = useProgress();

    return (
        <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center px-2 text-ui-text">
            <Button isIconOnly disableRipple aria-label="Open menu" title="Open menu" className={iconButton} onPress={drawer.onOpen}>
                <MenuIcon className="size-6"/>
            </Button>
            <div className="flex min-w-0 justify-center">{children}</div>
            <div className="flex h-11 min-w-11 items-center justify-end justify-self-end">
                {info ? <Dropdown placement="bottom-end" classNames={{ content: "min-w-56 rounded-lg bg-ui-sheet border border-ui-line text-ui-text" }}>
                    <DropdownTrigger>
                        <Button disableRipple aria-label={`Open account menu, ${progress?.stars ?? 0} stars`}
                                className="group h-11 min-w-0 gap-0 rounded-full bg-transparent px-0 data-[hover=true]:!bg-transparent data-[pressed=true]:!bg-transparent">
                            <StarPill info={info} progress={progress} earned={earned}/>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Account" variant="flat">
                        <DropdownSection showDivider aria-label="Your progress" classNames={{ divider: "bg-ui-line" }}>
                            <DropdownItem key="progress" isReadOnly textValue={`${progress?.stars ?? 0} stars, ${progress?.streak ?? 0} day streak, ${progress?.games ?? 0} games`}
                                          className="cursor-default data-[hover=true]:!bg-transparent">
                                <span className="grid grid-cols-3 gap-2 py-1">
                                    {summary(progress).map(({ label, value, icon: Icon, colour }) => <span key={label} className="flex flex-col gap-1">
                                        <span className="text-[17px] font-semibold tabular-nums">{compact.format(value)}</span>
                                        <span className="flex items-center gap-1 text-[12px] text-ui-muted"><Icon aria-hidden="true" className={`size-3.5 ${colour}`}/>{label}</span>
                                    </span>)}
                                </span>
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownItem key="stats" href="/stats" className="text-ui-text" startContent={<ChartColumnIcon className="size-4 text-ui-muted"/>}>View statistics</DropdownItem>
                        <DropdownItem key="logout" color="danger" className="text-ui-text" startContent={<LogOutIcon className="size-4 text-ui-muted"/>} onPress={logOutAndReload}>Log Out</DropdownItem>
                    </DropdownMenu>
                </Dropdown> : <Link href="/account/log-in" aria-label="Log in to save your progress" title="Log in"
                                   className="relative flex h-11 w-11 items-center justify-center rounded-lg text-ui-text hover:bg-ui-raised">
                    <UserRoundIcon className="size-6" strokeWidth={1.75}/>
                    <span aria-hidden="true" className="absolute right-2 top-2 size-2.5 rounded-full bg-ui-notice ring-2 ring-ui-bg"/>
                </Link>}
            </div>
            <Drawer isOpen={drawer.isOpen} onOpenChange={drawer.onOpenChange} placement="left" size="full" radius="none" hideCloseButton
                    classNames={{ base: "play-ui bg-ui-sheet text-ui-text" }}>
                <DrawerContent>{onClose => <>
                    <DrawerHeader className="relative flex h-[72px] items-center justify-between px-2 pb-0 pt-[env(safe-area-inset-top)]">
                        <Link href="/" aria-label="Bible Game home" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-lg">
                            <LogoMark size={28}/>
                        </Link>
                        <span className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold leading-6">Bible Game</span>
                        <Button isIconOnly disableRipple aria-label="Close menu" className={iconButton} onPress={onClose}><XIcon className="size-6"/></Button>
                    </DrawerHeader>
                    <DrawerBody className="px-4 pt-4">
                        <nav aria-label="Main navigation" className="grid gap-y-2">
                            {links.map(({ label, detail, href, prefix, icon: Icon }, index) => {
                                const active = pathname === prefix || pathname.startsWith(prefix + "/");
                                return <Link key={href} href={href} onClick={onClose} aria-current={active ? "page" : undefined}
                                             className="drawer-row drawer-link" style={rise(index)}>
                                    <Icon className="size-7 shrink-0" strokeWidth={1.5}/>
                                    <span className="min-w-0">
                                        <span className="block text-[18px] font-semibold leading-6">{label}</span>
                                        <span className="mt-0.5 block text-[14px] leading-5 text-ui-muted">{detail}</span>
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
                        </div> : <Link href="/account/log-in" onClick={onClose} className="drawer-row flex min-h-[68px] items-center gap-2.5 rounded-lg border border-ui-line bg-ui-surface px-3.5 py-2.5 hover:bg-ui-raised"
                                       style={rise(links.length)}>
                            <span className="relative flex size-[38px] shrink-0 items-center justify-center rounded-full bg-ui-raised ring-1 ring-ui-line">
                                <UserRoundIcon className="size-5" strokeWidth={1.75}/>
                                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-ui-notice ring-2 ring-ui-surface"/>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[16px] font-semibold leading-5">Log in</span>
                                <span className="mt-[5px] block text-[14px] leading-5 text-ui-muted"><LoginReasons/></span>
                            </span>
                            <ArrowRightIcon className="size-5 text-ui-muted"/>
                        </Link>}
                        <div className="drawer-row flex items-center justify-between border-t border-ui-line pt-2 text-[14px] text-ui-muted" style={rise(links.length + 1)}>
                            <nav aria-label="About Bible Game" className="flex">
                                {pages.map(({ label, href }) => <Link key={href} href={href} onClick={onClose}
                                                                      className="flex min-h-11 items-center px-[7px] first:pl-0 hover:text-ui-text">{label}</Link>)}
                            </nav>
                            <div className="-mr-2.5 flex items-center -space-x-1">
                                {social.map(({ label, href, icon: Icon }) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
                                                                               className="flex size-11 items-center justify-center rounded-lg hover:bg-ui-raised hover:text-ui-text">
                                    <Icon size={24} color="currentColor"/>
                                </a>)}
                            </div>
                        </div>
                        <p className="drawer-row -mt-3 font-mono text-[12px] text-ui-muted" style={rise(links.length + 2)}>v{process.env.APP_VERSION}</p>
                    </DrawerFooter>
                </>}</DrawerContent>
            </Drawer>
        </header>
    );
}
