"use client";

import Link from "next/link";
import { PlayIcon, BookOpenIcon, ChartColumnIcon, LightbulbIcon, ArrowRightIcon, ChevronDownIcon } from "lucide-react";
import Menu from "@/app/menu";
import GlowingCross from "@/app/home/glowing-cross";

const destinations = [
    { name: "Play", detail: "Today's chapter", href: "/play/today", icon: PlayIcon, colour: "text-play-green" },
    { name: "Read", detail: "Bible passages", href: "/read", icon: BookOpenIcon, colour: "text-play-teal" },
    { name: "Study", detail: "Questions and reflection", href: "/study", icon: LightbulbIcon, colour: "text-play-purple" },
    { name: "Statistics", detail: "Your progress", href: "/stats", icon: ChartColumnIcon, colour: "text-play-gold" },
];

export default function Landing(props: any) {
    return <div className="min-h-dvh">
        <Menu info={props.info}/>
        <main>
            <section className="home-hero">
                <GlowingCross/>
                <div className="home-hero-text">
                    <h1 className="text-[30px] font-semibold leading-tight">Bible Game</h1>
                    <p className="mt-3 font-clue text-[19px] italic leading-snug text-ui-muted">
                        &ldquo;I am the light of the world.&rdquo;
                        <cite className="mt-1 block font-sans text-[13px] not-italic text-ui-faint">John 8:12</cite>
                    </p>
                </div>
                <div className="home-hero-actions">
                    <Link href="/play/today" className="ui-button ui-primary h-12 w-full max-w-[18rem] !rounded-full text-[15px]">
                        <PlayIcon className="size-[18px]" strokeWidth={2}/>Play today&apos;s chapter
                    </Link>
                    <nav aria-label="More ways to explore" className="flex items-center gap-1 text-[14px] text-ui-muted">
                        {destinations.slice(1).map(({ name, href }) => <Link key={href} href={href}
                            className="rounded-full px-3 py-3 hover:text-ui-text">{name}</Link>)}
                    </nav>
                </div>
                <a href="#explore" aria-label="More about Bible Game" className="home-hero-cue">
                    <ChevronDownIcon className="size-5"/>
                </a>
            </section>
            <div id="explore" className="app-page">
                <nav aria-label="Explore Bible Game" className="divide-y divide-ui-line border-t border-ui-line">
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
            </div>
        </main>
    </div>;
}
