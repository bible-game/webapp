"use client";

import Link from "next/link";
import Image from "next/image";
import { PlayIcon, BookOpenIcon, ChartColumnIcon, LightbulbIcon, ArrowRightIcon } from "lucide-react";
import Menu from "@/app/menu";

const destinations = [
    { name: "Play", detail: "Today's chapter", href: "/play/today", icon: PlayIcon, colour: "text-play-green" },
    { name: "Read", detail: "Bible passages", href: "/read", icon: BookOpenIcon, colour: "text-play-teal" },
    { name: "Study", detail: "Questions and reflection", href: "/study", icon: LightbulbIcon, colour: "text-play-purple" },
    { name: "Statistics", detail: "Your progress", href: "/stats", icon: ChartColumnIcon, colour: "text-play-gold" },
];

export default function Landing(props: any) {
    return <div className="min-h-dvh">
        <Menu info={props.info}/>
        <main className="app-page">
            <header className="flex items-center gap-4 border-b border-ui-line pb-8 pt-6">
                <Image src="/icon-bright.png" alt="" width={64} height={64}/>
                <div>
                    <h1 className="text-[28px] font-semibold">Bible Game</h1>
                    <p className="mt-1 text-[14px] text-ui-muted">A daily chapter of discovery.</p>
                </div>
            </header>
            <nav aria-label="Explore Bible Game" className="divide-y divide-ui-line">
                {destinations.map(({ name, detail, href, icon: Icon, colour }) => <Link key={href} href={href}
                    className="flex min-h-[104px] items-center gap-4 py-5 transition-colors hover:bg-ui-surface">
                    <Icon className={`size-6 shrink-0 ${colour}`} strokeWidth={1.75}/>
                    <span className="min-w-0 flex-1"><span className="block text-[18px] font-semibold">{name}</span><span className="mt-1 block text-[14px] text-ui-muted">{detail}</span></span>
                    <ArrowRightIcon className="size-5 text-ui-muted"/>
                </Link>)}
            </nav>
            <footer className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[13px] text-ui-muted">
                <Link href="/about" className="hover:text-ui-text">About</Link>
                <Link href="/about/privacy" className="hover:text-ui-text">Privacy</Link>
                <Link href="/about/cookies" className="hover:text-ui-text">Cookies</Link>
                <span className="ml-auto">Bible Game {new Date().getFullYear()}</span>
            </footer>
        </main>
    </div>;
}
