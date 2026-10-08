"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Questions from "@/app/study/[passage]/questions";
import { ArrowLeftIcon, ArrowRightIcon, GraduationCapIcon, BookOpenIcon, StarIcon } from "lucide-react";
import { StateUtil } from "@/core/util/state-util";
import { ReviewState } from "@/core/model/state/review-state";
import { Star } from "@/app/play/[game]/star";
import { PassageViewer } from "@/app/study/[passage]/passage-viewer";
import { useReducedMotion } from "framer-motion";
import CannonConfettiCanvas from "@/core/component/confetti";

export default function StudyContent(props: any) {
    const title = prettyPassage(props.passage);
    const reducedMotion = useReducedMotion();

    const [stars, setStars] = useState(0);
    const [date, setDate] = useState("");
    const [updatedState, setUpdatedState] = useState({} as any);
    const MAX_STARS = 5;

    const [open, setOpen] = useState<boolean>(false);
    const [fireConfetti, setFireConfetti] = useState(false);

    useEffect(() => {
        if (props.state) StateUtil.setAllReviews(props.state);
        const state = StateUtil.getReview(props.passage) || ({} as ReviewState);
        setStars(state.stars || 0);

        let dateLabel = "";
        if (state && state.date) {
            const parts = state.date.split(" ");
            dateLabel = `${parts[1]} ${parts[2]} ${parts[3].split(",")[0]}`;
        }

        setDate(dateLabel);
    }, [props.passage, props.state, updatedState]);

    useEffect(() => {
        if (fireConfetti) {
            const timer = setTimeout(() => setFireConfetti(false), 2000); // Reset after a short delay
            return () => clearTimeout(timer);
        }
    }, [fireConfetti]);

    function prettyPassage(passage: string) {
        return passage.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, "$& ");
    }

    function update(state: any) {
        const newStars = state.stars || 0;
        if (newStars > stars) {
            setFireConfetti(true);
        }
        setStars(newStars);

        let dateLabel = "";
        if (state && state.date) {
            const parts = state.date.split(" ");
            dateLabel = `${parts[1]} ${parts[2]} ${parts[3].split(",")[0]}`;
        }

        setDate(dateLabel);
    }

    return (
        <div className="text-ui-text pb-16">
            <CannonConfettiCanvas fire={fireConfetti && !reducedMotion} />
            <header className="border-b border-ui-line mb-6">
                <div className="w-full">
                    <div className="study-toolbar flex items-center justify-between gap-1 py-3">
                        <Link
                            href={"/read/" + props.passage}
                            className="ui-button">
                            <ArrowLeftIcon className="size-5"/>
                            <span className="font-medium">Reading</span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="ui-button"
                            aria-haspopup="dialog"
                            aria-expanded={open}
                            aria-controls="passage-viewer">
                            <BookOpenIcon className="size-5"/>
                            <span className="font-medium">Passage</span>
                        </button>
                        <Link
                            href={"/study/"}
                            className="ui-button">
                            <span className="font-medium">All Studies</span>
                            <ArrowRightIcon className="size-5"/>
                        </Link>
                    </div>
                </div>
            </header>

            <section className="w-full">
                <div className="page-heading">
                    <h1 className="text-[24px] font-semibold">{title}</h1>
                    <p className="text-ui-muted">
                        Answer four questions and a short summary to earn stars.
                    </p>
                </div>
                <section
                    className="w-full">
                    <div
                        className="flex items-center justify-between gap-3 py-4 border-y border-ui-line mb-6">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="size-8 text-play-purple grid place-items-center">
                                <GraduationCapIcon className="size-5"/>
                            </div>
                            <div>
                                <div className="text-sm text-ui-muted">Study</div>
                                <div className="font-semibold leading-tight">{title}</div>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex items-center gap-0 justify-end" aria-label="Stars earned">
                                {Array.from({length: MAX_STARS}, (_, i) => (
                                    i < stars ? <Star key={i} className="!size-5 !text-play-accent" filled shadow={false}/> :
                                        <StarIcon key={i} className="size-5 text-ui-faint" strokeWidth={1.5}/>
                                ))}
                            </div>
                            {date && <p className="pt-1 text-xs text-ui-muted">{date}</p>}
                        </div>
                    </div>
                    <div className="w-full">
                        <Questions passage={props.passage} state={props.state} update={update}/>
                    </div>
                </section>
            </section>
            <PassageViewer id="passage-viewer" title={title} open={open} onClose={() => setOpen(false)}/>
        </div>
    );
}
