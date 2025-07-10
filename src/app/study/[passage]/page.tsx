"use server"

import React from "react";
import Link from "next/link";

/**
 * Study Page
 * @since 10th July 2025
 */
export default async function Study({params}: { params: Promise<{ passage: string }>}) {

    const { passage } = await params;

    return (
        <div className="bg-white absolute top-0 left-0 w-full h-full">
            <div className="flex justify-center">
                <Link href={"/read/"+passage} className="text-black">Back to Reading</Link>
                <main
                    className="bg-white h-min w-full text-black relative top-[6rem] overflow-auto pb-[12rem] flex justify-center">
                    { passage }
                </main>
            </div>
        </div>
    );
}