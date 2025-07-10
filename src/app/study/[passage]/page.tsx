"use server"

import { Toaster } from "react-hot-toast";
import React from "react";
import Background from "@/app/background";
import Navigation from "@/app/navigation";
import Explorer from "@/app/study/[passage]/explorer";

/**
 * Study Page
 * @since 10th July 2025
 */
export default async function Study({params}: { params: Promise<{ passage: string }>}) {

    const { passage } = await params;

    return (
        <>
            <Background/>
            <Navigation play={true} stats={true}/>
            <main className="flex top-8 sm:mt-8 m-0">
                <Toaster position="bottom-right"/>
                <section>
                    <h1 className="text-[1.5rem] mx-0">Study</h1>
                    { passage }
                    <Explorer />
                </section>
            </main>
        </>
    );
}