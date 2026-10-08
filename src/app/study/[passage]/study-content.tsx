"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import AppHeader from "@/core/component/app-header";
import CannonConfettiCanvas from "@/core/component/confetti";
import { useDivisionAccent } from "@/core/hook/use-division-accent";
import { getStudy, Study } from "@/core/action/study/get-study";
import { ReviewState } from "@/core/model/state/review-state";
import { StateUtil } from "@/core/util/state-util";
import { parseStudyKey } from "@/app/study/study-util";
import Quiz from "@/app/study/[passage]/quiz";
import Results from "@/app/study/[passage]/results";
import { PassageViewer } from "@/app/study/[passage]/passage-viewer";

/**
 * A study: the quiz until it's submitted, then your result
 * @since 10th July 2025
 */
export default function StudyContent(props: { passage: string; state?: Map<string, ReviewState>; info?: any }) {
    const { book, chapter } = parseStudyKey(props.passage);
    const title = book ? `${book.name} ${chapter}` : props.passage.replace(/[a-z](?=\d)|\d(?=[a-z])/gi, "$& ");
    useDivisionAccent(book);

    const [study, setStudy] = useState<Study | undefined>();
    const [failed, setFailed] = useState(false);
    const [review, setReview] = useState<ReviewState | undefined>();
    const [ready, setReady] = useState(false);
    const [step, setStep] = useState(0);
    const [passageOpen, setPassageOpen] = useState(false);
    const [confetti, setConfetti] = useState(false);
    const reducedMotion = useReducedMotion();

    // A submitted study (answers saved, here or on the account) opens on its result
    useEffect(() => {
        if (props.state) StateUtil.setAllReviews(props.state as any);
        const saved = StateUtil.getReview(props.passage);
        setReview(saved.answers?.length ? saved : undefined);
        setReady(true);
    }, [props.passage, props.state]);

    useEffect(() => {
        getStudy(props.passage)
            .then((response: Study) => response?.questions?.length ? setStudy(response) : setFailed(true))
            .catch(() => setFailed(true));
    }, [props.passage]);

    useEffect(() => {
        if (!confetti) return;
        const t = setTimeout(() => setConfetti(false), 2000);
        return () => clearTimeout(t);
    }, [confetti]);

    const onStep = useCallback((s: number) => setStep(s), []);

    function onSubmit(next: ReviewState) {
        if (next.stars > 0) setConfetti(true);
        setReview(next);
        window.scrollTo({ top: 0 });
    }

    const steps = (study?.questions.length ?? 4) + 1;
    const subtitle = review ? "Your result" : step < steps - 1 ? `Question ${step + 1} of ${steps}` : "Summary";
    const progress = review ? 100 : (step / steps) * 100;

    return (
        <div className="study min-h-dvh">
            <CannonConfettiCanvas fire={confetti && !reducedMotion} />
            <div className="reader-header">
                <div className="app-header">
                    <AppHeader info={props.info}>
                        <div className="flex min-w-0 flex-col items-center">
                            <span className="reader-title truncate">{title}</span>
                            <span className="text-[11px] tabular-nums text-ui-muted">{ready ? subtitle : " "}</span>
                        </div>
                    </AppHeader>
                </div>
                <div aria-hidden className="reader-progress">
                    <div className="transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <main className="app-page">
                <div className="mx-auto w-full max-w-[40rem]">
                    {!ready ? null : review ? (
                        <Results passage={props.passage} review={review} study={study} title={title} />
                    ) : failed ? (
                        <div role="alert" className="flex flex-col items-start gap-3 py-8 text-ui-muted">
                            <p>Unable to load this study.</p>
                            <button type="button" className="ui-button" onClick={() => window.location.reload()}>Try again</button>
                        </div>
                    ) : !study ? (
                        <div className="reading-skeleton pt-14" role="status" aria-label="Loading study">
                            {[88, 64, 0, 100, 100, 100].map((w, i) => <span key={i} style={{ width: `${w}%`, height: i > 2 ? 56 : 18 }} />)}
                        </div>
                    ) : (
                        <Quiz passage={props.passage} study={study} title={title} loggedIn={!!props.state}
                              onStep={onStep} onPassage={() => setPassageOpen(true)} onSubmit={onSubmit} />
                    )}
                </div>
            </main>

            <PassageViewer title={title} open={passageOpen} onClose={() => setPassageOpen(false)} />
        </div>
    );
}
