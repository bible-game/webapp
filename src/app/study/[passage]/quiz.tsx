'use client'

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import moment from 'moment';
import TextareaAutosize from 'react-textarea-autosize';
import { useDebouncedCallback } from 'use-debounce';
import { ArrowLeftIcon, BookOpenIcon } from 'lucide-react';
import { Spinner } from '@heroui/react';
import { gradeSummary } from '@/core/action/study/grade-summary';
import { Question, Study } from '@/core/action/study/get-study';
import { GradingResult, ReviewState } from '@/core/model/state/review-state';
import { StateUtil } from '@/core/util/state-util';
import { post } from '@/core/action/http/post';
import { REVIEW_DATE_FORMAT } from '@/app/study/study-util';

export const LETTERS = ['A', 'B', 'C'];

/** A question's options, in order */
export const optionsOf = (q: Question) => [q.optionOne, q.optionTwo, q.optionThree];

/** The summary score's tint: won, amber, or lost, as before */
export const scoreTone = (score: number) => score > 60 ? 'var(--ui-won)' : score > 40 ? 'var(--ui-amber)' : 'var(--ui-lost)';

type Props = {
    /** The study's key, as in its address; reviews are saved under it */
    passage: string;
    study: Study;
    title: string;
    loggedIn: boolean;
    onStep: (step: number) => void;
    onPassage: () => void;
    onSubmit: (review: ReviewState) => void;
};

/**
 * The study, one step at a time: four questions, then a summary
 * @since 8th October 2026
 */
export default function Quiz({ passage, study, title, loggedIn, onStep, onPassage, onSubmit }: Props) {
    const questions = study.questions;
    const steps = questions.length + 1;
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [summary, setSummary] = useState('');
    const [grading, setGrading] = useState<GradingResult>(null);
    const [isGrading, setIsGrading] = useState(false);
    const reduced = useReducedMotion();
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const onSummary = step === questions.length;
    const question = questions[step];
    const allAnswered = questions.every((_, i) => answers[i]);

    useEffect(() => {
        onStep(step);
        window.scrollTo({ top: 0 });
    }, [step, onStep]);

    const grade = useDebouncedCallback((text: string) => {
        if (!text.trim()) { setGrading(null); setIsGrading(false); return; }
        setIsGrading(true);
        gradeSummary(passage, text).then((response) => {
            setGrading(response);
            setIsGrading(false);
        });
    }, 800);

    function choose(option: string) {
        const next = [...answers];
        next[step] = option;
        setAnswers(next);
    }

    // Arrow keys move the choice within the group, as for native radios
    function onOptionKey(e: React.KeyboardEvent, index: number) {
        const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!delta) return;
        e.preventDefault();
        const options = optionsOf(question);
        const nextIndex = (index + delta + options.length) % options.length;
        choose(options[nextIndex]);
        optionRefs.current[nextIndex]?.focus();
    }

    function submit() {
        let stars = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
        if (grading && grading.score > 60) stars += 1;

        const review: ReviewState = {
            stars,
            answers,
            passageKey: passage,
            date: moment(new Date()).format(REVIEW_DATE_FORMAT),
            summary,
            gradingResult: grading || { score: 0, message: '' },
        };

        if (loggedIn) post(`${process.env.SVC_USER}/state/review`, review);
        StateUtil.setReview(review);
        onSubmit(review);
    }

    const motionProps = reduced
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
        : { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.18 } };

    const selectedIndex = question ? optionsOf(question).indexOf(answers[step]) : -1;

    return (
        <div className="pb-36">
            <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
                <span className="text-[13px] text-ui-muted">{onSummary ? 'In your own words' : 'Choose one'}</span>
                <button type="button" onClick={onPassage}
                        className="-mr-2 flex min-h-11 items-center gap-2 rounded-lg px-2 text-[13px] text-ui-muted hover:text-ui-text">
                    <BookOpenIcon className="size-4" />Passage
                </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
                <motion.section key={step} {...motionProps} aria-live="polite">
                    {!onSummary ? (
                        <>
                            <h2 id={`q-${step}`} className="mb-8 font-clue text-[24px] font-medium leading-[1.3] text-pretty">
                                {question.content}
                            </h2>
                            <div role="radiogroup" aria-labelledby={`q-${step}`} className="grid gap-3">
                                {optionsOf(question).map((option, i) => {
                                    const checked = answers[step] === option;
                                    return (
                                        <button key={i} type="button" role="radio" aria-checked={checked}
                                                ref={(el) => { optionRefs.current[i] = el; }}
                                                tabIndex={checked || (selectedIndex === -1 && i === 0) ? 0 : -1}
                                                onClick={() => choose(option)}
                                                onKeyDown={(e) => onOptionKey(e, i)}
                                                className="study-option">
                                            <span aria-hidden className="badge">{LETTERS[i]}</span>
                                            <span>{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 id="summary-label" className="mb-2 font-clue text-[24px] font-medium leading-[1.3] text-pretty">
                                Summarise {title} in your own words
                            </h2>
                            <p className="mb-6 text-[14px] text-ui-muted">A summary that captures the chapter earns a fifth star.</p>
                            <TextareaAutosize
                                value={summary}
                                onChange={(e) => { setSummary(e.target.value); grade(e.target.value); }}
                                minRows={6}
                                aria-labelledby="summary-label"
                                className="reader-field w-full py-3 text-[16px] leading-[1.6] outline-none"
                                placeholder="What happens in this chapter, and what does it teach?"
                            />
                            <div className="mt-3 min-h-6 text-[13px]" aria-live="polite">
                                {isGrading ? (
                                    <span className="flex items-center gap-2 text-ui-muted"><Spinner size="sm" color="default" />Scoring…</span>
                                ) : grading ? (
                                    <span className="flex items-start gap-2">
                                        <span className="shrink-0 rounded-full px-2 py-0.5 font-semibold tabular-nums"
                                              style={{ color: scoreTone(grading.score), background: `color-mix(in srgb, ${scoreTone(grading.score)} 14%, transparent)` }}>
                                            {grading.score}
                                        </span>
                                        <span className="text-ui-muted">{grading.message}</span>
                                    </span>
                                ) : null}
                            </div>
                        </>
                    )}
                </motion.section>
            </AnimatePresence>

            <div className="fixed inset-x-0 bottom-0 z-30 bg-[linear-gradient(180deg,transparent,var(--ui-bg)_24px)] pt-6">
                <div className="mx-auto flex max-w-[43rem] items-center gap-3 px-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-6">
                    {step > 0 ? (
                        <button type="button" aria-label="Previous question" onClick={() => setStep(step - 1)}
                                className="grid size-12 shrink-0 place-items-center rounded-full bg-ui-raised text-ui-text hover:bg-ui-line">
                            <ArrowLeftIcon className="size-5" />
                        </button>
                    ) : null}
                    {onSummary ? (
                        <button type="button" onClick={submit} disabled={!allAnswered}
                                className="ui-button reader-primary h-12 flex-1 !rounded-full text-[15px] disabled:!opacity-40 disabled:!shadow-none">
                            {allAnswered ? 'Submit' : 'Answer every question to submit'}
                        </button>
                    ) : (
                        <button type="button" onClick={() => setStep(step + 1)} disabled={!answers[step]}
                                className="ui-button reader-primary h-12 flex-1 !rounded-full text-[15px] disabled:!opacity-40 disabled:!shadow-none">
                            {step === steps - 2 ? 'Next: summary' : 'Next'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
