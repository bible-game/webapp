"use client";

import Link from "next/link";
import Menu from "@/app/menu";
import GlowingCross from "@/app/home/glowing-cross";
import HowItWorks from "@/app/home/how-it-works";
import TodayAction from "@/app/home/today-action";

const destinations = [
    { name: "Read", href: "/read" },
    { name: "Study", href: "/study" },
    { name: "Statistics", href: "/stats" },
];

export default function Landing(props: any) {
    return <div className="min-h-dvh">
        <Menu info={props.info}/>
        <main>
            <section className="home-hero">
                <GlowingCross/>
                <div className="home-hero-text">
                    <h1 className="text-[30px] font-semibold leading-tight">Bible Game</h1>
                    <p className="mx-auto mt-3 max-w-[17rem] text-[16px] leading-relaxed text-ui-muted">
                        Explore the Bible with a daily passage guessing game
                    </p>
                </div>
                <div className="home-hero-actions">
                    <TodayAction state={props.state}/>
                    <nav aria-label="More ways to explore" className="flex items-center gap-1 text-[14px] text-ui-muted">
                        {destinations.map(({ name, href }) => <Link key={href} href={href}
                            className="rounded-full px-3 py-3 hover:text-ui-text">{name}</Link>)}
                    </nav>
                </div>
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
