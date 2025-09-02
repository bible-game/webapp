"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, PlayIcon } from "lucide-react";
import Background from "@/app/background";
import Menu from "@/app/menu";

export default function Study(props: any) {
    return (
        <>
            <Background />
            <main className="min-h-screen text-[#e8ecff] flex flex-col z-10 relative items-center w-full">
                <Menu isLanding={false} info={props.info} />
                <section className="flex flex-col items-center justify-center text-center py-10 sm:py-20 px-6 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}>
                        <h1 className="text-4xl font-extrabold m-0 flex items-center gap-3">
                            <GraduationCap className="opacity-80" size={48} />
                            Study
                        </h1>
                    </motion.div>
                </section>
                <section className="w-full max-w-2xl mx-auto px-8 sm:px-6 pb-10 sm:pb-20 text-center">
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.5, duration: 0.8}}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
                        <p className="text-sm sm:text-base text-[#adb3d6]">
                            ⚠️ This feature is under development
                        </p>
                    </motion.div>
                </section>
                <footer className="mt-auto py-6 border-t border-white/10 text-center text-sm text-[#adb3d6] w-full">
                    © {new Date().getFullYear()} Bible Game
                </footer>
            </main>
        </>
    );
}
