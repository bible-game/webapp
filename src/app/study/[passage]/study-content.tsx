"use client"

import React, {useEffect, useState} from "react";
import Link from "next/link";
import Questions from "@/app/study/[passage]/questions";
import { ArrowLeftIcon, ArrowRightIcon, GraduationCapIcon } from "lucide-react";
import { StateUtil} from "@/core/util/state-util";
import { ReviewState } from "@/core/model/state/review-state";
import {Star} from "@/app/play/[game]/star";

export default function StudyContent(props: any) {

    const title = prettyPassage(props.passage);

    const [stars, setStars] = useState(0);
    const [date, setDate] = useState('');
    const MAX_STARS = 5;

    useEffect(() => {
        if (props.state) StateUtil.setAllReviews(props.state);
        const state = StateUtil.getReview(props.passage) || {} as ReviewState;
        setStars(state.stars || 0);

        let dateLabel = '';
        if (state && state.date) {
            const parts = state.date.split(" ");
            dateLabel = `${parts[1]} ${parts[2]} ${parts[3].split(",")[0]}`
        }

        setDate(dateLabel);
    }, [props.passage, props.state]);

    function prettyPassage(passage: string) {
        return passage.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, "$& ");
    }

    return (
        <div className="text-slate-900 pb-16">
            <header
                className="bg-white/90 border-b border-slate-200/60">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="h-14 flex items-center justify-between gap-3">
                        <Link href={"/read/" + props.passage} className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 rounded-xl px-3 py-1.5 hover:bg-slate-100 transition">
                            <ArrowLeftIcon className="size-5"/><span className="font-medium">Reading</span>
                        </Link>
                        <Link href={"/study/"} className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 rounded-xl px-3 py-1.5 hover:bg-slate-100 transition">
                            <span className="font-medium">All Studies</span><ArrowRightIcon className="size-5"/>
                        </Link>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-3xl sm:px-6">
                <div className="mb-5">
                    <h1 className="text-3xl sm:text-4xl font-bold mx-2 mb-0">{title}</h1>
                    <p className="text-slate-400 mx-2 mt-2 pb-2 font-light">Answer four questions and a short summary to earn stars.</p>
                </div>

                <section
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    <div
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-200/70 bg-gradient-to-br from-white to-slate-50">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center font-semibold">
                                <GraduationCapIcon className="size-5" />
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Study</div>
                                <div className="font-semibold leading-tight">{title}</div>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex items-center gap-0 justify-end" aria-label="Stars earned">
                                {Array.from({length: MAX_STARS}, (_, i) => (
                                    <Star
                                        key={i}
                                        className={`size-5 ${i < stars ? 'text-amber-500' : 'text-slate-300'}`}
                                        filled={i < stars}
                                        shadow={false}
                                    />
                                ))}
                            </div>
                            {date && (<p className="pt-1 text-xs text-slate-500">{date}</p>)}
                        </div>
                    </div>
                    <div className="p-4 sm:p-6">
                        <Questions passage={props.passage} state={props.state}/>
                    </div>
                </section>
            </section>
        </div>
    );
}