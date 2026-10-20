"use client";

import Link from "next/link";
import { ChevronDownIcon, PlayIcon, UserRoundIcon } from "lucide-react";
import Menu from "@/app/menu";
import GlowingCross from "@/app/home/glowing-cross";
import HowItWorks from "@/app/home/how-it-works";

export default function Landing(props: any) {
    return <div className="min-h-dvh">
        <Menu info={props.info}/>
        <main>
            <section className="home-hero">
                <GlowingCross/>
                <h1 className="home-hero-text home-tagline">
                    Explore the Bible <em>with a daily passage-guessing game</em>
                </h1>
                <div className="home-hero-actions">
                    {/* a logged-out visitor who has logged in on this device before is invited back in, then on to today's game */}
                    {props.known ?
                        <Link href="/account/log-in?next=/play/today" className="ui-button ui-primary h-12 w-full max-w-[18rem] text-[15px]">
                            <UserRoundIcon className="size-[18px]" strokeWidth={2}/>Login
                        </Link> :
                        <Link href="/play/today" className="ui-button ui-primary h-12 w-full max-w-[18rem] text-[15px]">
                            <PlayIcon className="size-[18px]" strokeWidth={2}/>Play today&apos;s chapter
                        </Link>}
                </div>
                <a href="#how-it-works" className="home-hero-cue">
                    How it works
                    <ChevronDownIcon className="size-5" aria-hidden="true"/>
                </a>
            </section>
            <div className="app-page home-more">
                <HowItWorks/>
                <footer className="mt-16 flex flex-wrap gap-x-5 gap-y-3 border-t border-ui-line pt-6 text-[13px] text-ui-muted">
                    <Link href="/about" className="hover:text-ui-text">About</Link>
                    <Link href="/about/privacy" className="hover:text-ui-text">Privacy</Link>
                    <Link href="/about/cookies" className="hover:text-ui-text">Cookies</Link>
                    <span className="ml-auto">Bible Game {new Date().getFullYear()}</span>
                </footer>
            </div>
        </main>
    </div>;
}
