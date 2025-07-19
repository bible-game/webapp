"use server"

import React from "react";
import Link from "next/link";
import Questions from "@/app/study/[passage]/questions";
import isLoggedIn from "@/core/util/auth-util";
import { ReviewState } from "@/core/model/state/review-state";
import { getReviewState } from "@/core/action/state/get-state-review";

/**
 * Study Page
 * @since 10th July 2025
 */
export default async function Study({params}: { params: Promise<{ passage: string }>}) {

    const { passage } = await params;

    let state: Map<string,ReviewState> | undefined;
    if (await isLoggedIn()) state = await getReviewState();

    return (
        <div className="bg-white absolute top-0 left-0 w-full h-full">
            <div className="flex justify-center bg-white">
                <Link href={"/read/" + passage} className="left-4 top-4 text-black w-[12rem] flex gap-2 items-center h-min absolute">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.25"
                         stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                    </svg>
                    <span className="font-light">Back to Read</span>
                </Link>
                <main
                    className="bg-white flex justify-center sm:w-[46rem] w-full text-black relative top-10 sm:top-0 pb-[2rem] h-fit">
                    <div className="w-full p-4 min-h-full">
                        <h1 className="text-3xl mb-4">{passage.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, '$& ')}</h1>
                        <Questions passage={passage} state={state}/>
                    </div>
                </main>
            </div>
        </div>
    );
}