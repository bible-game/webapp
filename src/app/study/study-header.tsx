'use client';

import { motion } from "framer-motion";

export default function StudyHeader() {
    return (
        <section className="flex flex-col items-center justify-center text-center py-10 sm:py-20 px-6 w-full">
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8}}>
                <h1 className="text-4xl font-extrabold m-0 flex items-center justify-center gap-3 text-center">
                    Study
                </h1>
                <p className="mt-3 text-[#adb3d6] max-w-xl">
                    Stretch your understanding with a few questions.
                </p>
            </motion.div>
        </section>
    );
}