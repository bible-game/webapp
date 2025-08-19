"use client";

import Link from "next/link";
import { Play, BookOpen, BarChart3, GraduationCap } from "lucide-react";
import Background from "@/app/background";
import Menu from "@/app/menu";
import { motion } from "framer-motion";

export default function Landing(props: any) {
    return (
        <>
            <Background />
            <main className="min-h-screen text-[#e8ecff] flex flex-col z-10 relative items-center">
                <Menu isLanding={true} info={props.info} />

                {/* Hero */}
                <section className="flex flex-col items-center justify-center text-center py-20 px-6">
                    <motion.h1
                        className="text-5xl font-extrabold m-0"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Bible Game
                    </motion.h1>

                    <motion.p
                        className="mt-4 text-lg md:text-xl text-[#adb3d6] max-w-2xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}>
                        Explore the Bible with a daily passage guessing game 📖✨
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                    >
                        <Link
                            href="/play/today"
                            className="mt-8 px-6 py-3 rounded-full bg-white/10 border border-white/20 font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2">
                            <Play size={18} /> Play Today’s Game
                        </Link>
                    </motion.div>
                </section>

                {/* Game Modes */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl mx-auto px-6 pb-20">
                    <Link href="/play/today" className="block">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="bg-gradient-to-r from-green-600/70 to-green-400/60 rounded-2xl shadow-lg p-6"
                        >
                            <p className="text-sm uppercase text-white/70 font-bold">Play</p>
                            <h3 className="text-xl font-semibold mt-1 flex items-center gap-2">
                                <Play size={20} /> Daily Challenge
                            </h3>
                            <p className="text-sm text-white/80 mt-2">
                                Build a mental map of Scripture.
                            </p>
                        </motion.div>
                    </Link>

                    <Link href="/read" className="block">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="bg-gradient-to-r from-blue-600/70 to-blue-400/60 rounded-2xl shadow-lg p-6"
                        >
                            <p className="text-sm uppercase text-white/70 font-bold">Read</p>
                            <h3 className="text-xl font-semibold mt-1 flex items-center gap-2">
                                <BookOpen size={20} /> Daily Reading
                            </h3>
                            <p className="text-sm text-white/80 mt-2">
                                Track your Bible reading.
                            </p>
                        </motion.div>
                    </Link>

                    <Link href="/study" className="block">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="bg-gradient-to-r from-purple-600/70 to-purple-400/60 rounded-2xl shadow-lg p-6"
                        >
                            <p className="text-sm uppercase text-white/70 font-bold">Study</p>
                            <h3 className="text-xl font-semibold mt-1 flex items-center gap-2">
                                <GraduationCap size={20} /> Learn & Explore
                            </h3>
                            <p className="text-sm text-white/80 mt-2">
                                Dive deeper into passages.
                            </p>
                        </motion.div>
                    </Link>

                    <Link href="/stats" className="block">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="bg-gradient-to-r from-yellow-600/70 to-yellow-400/60 rounded-2xl shadow-lg p-6"
                        >
                            <p className="text-sm uppercase text-white/70 font-bold">Stats</p>
                            <h3 className="text-xl font-semibold mt-1 flex items-center gap-2">
                                <BarChart3 size={20} /> Statistics
                            </h3>
                            <p className="text-sm text-white/80 mt-2">
                                Track your scores over time.
                            </p>
                        </motion.div>
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