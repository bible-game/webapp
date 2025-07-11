"use server"

import React from "react";
import Link from "next/link";
import { getStudy } from "@/core/action/get-study";
import Questions from "@/app/study/[passage]/questions";

/**
 * Study Page
 * @since 10th July 2025
 */
export default async function Study({params}: { params: Promise<{ passage: string }>}) {

    const { passage } = await params;

    const study: any = await getStudy(passage);

    return (
        <div className="bg-white absolute top-0 left-0 w-full h-full">
            <div className="flex justify-center">
                <Link href={"/read/" + passage} className="p-4 text-black w-[12rem] flex gap-2 items-center h-min">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.25"
                         stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                    </svg>
                    <span className="font-light">Back to Read</span>
                </Link>
                <main
                    className="bg-white h-min w-full text-black relative top-[6rem] overflow-auto pb-[12rem] flex justify-center">
                    <div className="w-full max-w-4xl p-4">
                    <h1 className="text-2xl font-bold mb-4">{passage.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, '$& ')}</h1>
                        <p className="mb-8">{study.text}</p>
                        <Questions questions={study.questions} passage={passage} />
                    </div>
                </main>
            </div>
        </div>
    );
}