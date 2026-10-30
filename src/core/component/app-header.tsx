"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { ArrowRightIcon, BookOpenIcon, ChartColumnIcon, LightbulbIcon, MenuIcon, PlayIcon, StarIcon, UserRoundIcon, XIcon } from "lucide-react";
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

function useStars(enabled: boolean) {
    const [stars, setStars] = useState<number>();

    useEffect(() => {
        if (!enabled) return;
        const update = () => setStars(CompletionUtil.calcStars());
        update();
        window.addEventListener(StorageUtil.CHANGED, update);
        window.addEventListener("storage", update);
        return () => {
            window.removeEventListener(StorageUtil.CHANGED, update);
            window.removeEventListener("storage", update);
        };
    }, [enabled]);

    return stars;
}

const roll = {
    enter: (direction: number) => ({ y: `${direction * 100}%`, opacity: 0 }),
    centre: { y: "0%", opacity: 1 },
    exit: (direction: number) => ({ y: `${direction * -100}%`, opacity: 0 }),
};

/** A figure whose changed digits roll vertically: up as it grows, down as it falls. Digits are keyed by place from
 *  the right, so only the ones that change move; separators and signs ride along */
function RollingNumber({ value, text }: { value: number; text: string }) {
    const reduce = useReducedMotion();
    const previous = useRef(value);
    const direction = value >= previous.current ? 1 : -1;
    useEffect(() => { previous.current = value; }, [value]);

    const chars = [...text];
    return <span aria-hidden="true" className="inline-flex tabular-nums">
        {chars.map((char, i) => <span key={chars.length - i} className="relative inline-block h-[1.25em] overflow-hidden leading-[1.25em]">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                <motion.span key={char} className="block" custom={direction} variants={roll} initial="enter" animate="centre" exit="exit"
                             transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}>
                    {char}
                </motion.span>
            </AnimatePresence>
        </span>)}
    </span>;
}

function StarPill({ info, stars }: { info: NonNullable<AppHeaderProps["info"]>; stars?: number }) {
    return <span className="flex h-9 items-center gap-1.5 rounded-full bg-ui-raised pl-2.5 pr-1 text-[13px] font-semibold text-ui-text ring-1 ring-ui-line transition-colors group-data-[hover=true]:bg-ui-light-2 group-data-[pressed=true]:bg-ui-light-2">
        <StarIcon aria-hidden="true" className="size-3.5 shrink-0 text-play-gold" fill="currentColor"/>
        {/* A count-sized placeholder until this device's stars are read, so the pill doesn't jump when they arrive */}
        {stars === undefined
            ? <span aria-hidden="true" className="h-3 w-[3ch] animate-pulse rounded-full bg-ui-light-2"/>
            : <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }}>
                <RollingNumber value={stars} text={stars.toLocaleString("en")}/>
            </motion.span>}
        <Avatar aria-hidden="true" className="size-7 bg-ui-sheet text-[11px] font-semibold text-ui-text" name={initials(info)}/>
    </span>;
}

const initials = (info: NonNullable<AppHeaderProps["info"]>) => (info.firstname[0] ?? "").toUpperCase() + (info.lastname[0] ?? "").toUpperCase();
const rise = (index: number) => ({ animationDelay: `${80 + index * 30}ms` });
const logOutAndReload = () => logOut().then(() => window.location.reload());

/** The width of the header's wider side, so both sides can take it: the middle item stays centred and is the one to
 *  give way when space is short, never the account pill */
function useSideWidth() {
    const account = useRef<HTMLDivElement>(null);
    const [side, setSide] = useState(44);

    useEffect(() => {
        const element = account.current;
        if (!element) return;
        const observer = new ResizeObserver(() => setSide(Math.max(44, Math.ceil(element.getBoundingClientRect().width))));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return { account, side };
}

export default function AppHeader({ info, children }: AppHeaderProps) {
    const drawer = useDisclosure();
    const pathname = usePathname();
    // Read and Statistics show the player's progress themselves, so their header keeps the plain avatar
    const plain = ["/read", "/stats"].some(prefix => pathname.startsWith(prefix));
    const stars = useStars(!!info && !plain);
    const { account, side } = useSideWidth();

    return (
        // Equal side columns, so the page's middle item (date, passage, title) stays centred
        <header className="grid h-14 shrink-0 grid-cols-[minmax(var(--side),1fr)_minmax(0,auto)_minmax(var(--side),1fr)] items-center px-2 text-ui-text"
                style={{ "--side": `${side}px` } as React.CSSProperties}>
            <Button isIconOnly disableRipple aria-label="Open menu" title="Open menu" className={iconButton} onPress={drawer.onOpen}>
                <MenuIcon className="size-6"/>
            </Button>
            <div className="flex min-w-0 justify-center px-1 *:min-w-0 *:max-w-full">{children}</div>
            <div ref={account} className="flex h-11 min-w-11 items-center justify-end justify-self-end">
                {info ? <Dropdown placement="bottom-end" classNames={{ content: "rounded-lg bg-ui-sheet border border-ui-line text-ui-text" }}>
                    <DropdownTrigger>
                        <Button disableRipple aria-label={plain || stars === undefined ? "Open account menu" : `Open account menu, ${stars} stars`}
                                className={`group h-11 min-w-0 gap-0 rounded-full bg-transparent px-0 data-[hover=true]:!bg-transparent data-[pressed=true]:!bg-transparent ${plain ? "w-11" : ""}`}>
                            {plain
                                ? <Avatar aria-hidden="true" className="size-8 bg-ui-raised text-[12px] font-semibold text-ui-text ring-1 ring-ui-line" name={initials(info)}/>
                                : <StarPill info={info} stars={stars}/>}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Account" variant="flat">
                        <DropdownItem key="logout" color="danger" className="text-ui-text" onPress={logOutAndReload}>Log Out</DropdownItem>
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
