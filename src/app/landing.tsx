"use client";

import Link from "next/link";
import { Play, BookOpen, BarChart3, GraduationCap } from "lucide-react";
import Background from "@/app/background";
import Menu from "@/app/menu";

export default function Landing(props: any) {
    return (
        <>
            <Background />
            <main className="min-h-screen text-[#e8ecff] flex flex-col z-10 relative">
                <Menu isLanding={true} info={props.info}/>
                <section className="flex flex-col items-center justify-center text-center py-20 px-6">
                    <div className="flex gap-2 items-center">
                        <h1 className="text-5xl font-extrabold m-0">Bible Game</h1>
                    </div>
                    <p className="mt-4 text-lg md:text-xl text-[#adb3d6] max-w-2xl">Explore Bible the daily passage guessing game 📖✨.</p>
                    <Link
                        href="/play/today"
                        className="mt-8 px-6 py-3 rounded-full bg-white/10 border border-white/20 font-semibold hover:bg-white/20 transition-colors flex items-center gap-2">
                        <Play size={18}/> Play Today’s Game
                    </Link>
                </section>

                {/* Game Modes Section */}
                <section
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl mx-auto px-6 pb-20">
                    <Link href="/play/today" className="block">
                        <div
                            className="bg-gradient-to-r from-green-600/70 to-green-400/60 rounded-2xl shadow-lg p-6 hover:scale-[1.02] transition-transform">
                            <p className="text-sm uppercase text-white/70 font-bold">Play</p>
                            <h3 className="text-xl font-semibold mt-1 flex items-center gap-2">
                                <Play size={20}/> Daily Challenge
                            </h3>
                            <p className="text-sm text-white/80 mt-2">
                                Guess today’s chapter in five tries.
                            </p>
                        </div>
                    </Link>

                    <Link href="/read" className="block">
                        <div
                            className="bg-gradient-to-r from-blue-600/70 to-blue-400/60 rounded-2xl shadow-lg p-6 hover:scale-[1.02] transition-transform">
                            <p className="text-sm uppercase text-white/70 font-bold">Read</p>
                            <h3 className="text-xl font-semibold mt-1 flex items-center gap-2">
                                <BookOpen size={20}/> Daily Reading
                            </h3>
                            <p className="text-sm text-white/80 mt-2">
                                Track your Bible reading alongside the game.
                            </p>
                        </div>
                    </Link>

                    <Link href="/study" className="block">
                        <div
                            className="bg-gradient-to-r from-purple-600/70 to-purple-400/60 rounded-2xl shadow-lg p-6 hover:scale-[1.02] transition-transform">
                            <p className="text-sm uppercase text-white/70 font-bold">Study</p>
                            <h3 className="text-xl font-semibold mt-1 flex items-center gap-2">
                                <GraduationCap size={20}/> Learn & Explore
                            </h3>
                            <p className="text-sm text-white/80 mt-2">
                                Dive deeper into passages and cross-references.
                            </p>
                        </div>
                    </Link>

                    <Link href="/stats" className="block">
                        <div
                            className="bg-gradient-to-r from-yellow-600/70 to-yellow-400/60 rounded-2xl shadow-lg p-6 hover:scale-[1.02] transition-transform">
                            <p className="text-sm uppercase text-white/70 font-bold">Stats</p>
                            <h3 className="text-xl font-semibold mt-1 flex items-center gap-2">
                                <BarChart3 size={20}/> Statistics
                            </h3>
                            <p className="text-sm text-white/80 mt-2">
                                Track your accuracy and streaks over time.
                            </p>
                        </div>
                    </Link>
                </section>

                {/* Footer */}
                <footer className="mt-auto py-6 border-t border-white/10 text-center text-sm text-[#adb3d6]">
                    © {new Date().getFullYear()} Bible Game — Made for curious readers and visual learners.
                </footer>
            </main>
        </>
    );
}
