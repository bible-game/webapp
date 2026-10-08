'use client'

import React from 'react';
import Link from 'next/link';
import { BookOpenIcon, CheckCircle2, StarIcon, XCircle } from 'lucide-react';
import { Star } from '@/app/play/[game]/star';
import { Study } from '@/core/action/study/get-study';
import { ReviewState } from '@/core/model/state/review-state';
import { parseReviewDate } from '@/app/study/study-util';
import { LETTERS, optionsOf, scoreTone } from '@/app/study/[passage]/quiz';

const MAX_STARS = 5;

type Props = {
    passage: string;
    review: ReviewState;
    study?: Study;
    title: string;
};

/** An answer as reviewed: right or wrong in colour, and always by icon and label too */
function Answer({ letter, text, right, label }: { letter: string; text: string; right: boolean; label: string }) {
    const Icon = right ? CheckCircle2 : XCircle;
    return (
        <div className="study-option !cursor-default" data-result={right ? 'right' : 'wrong'}>
            <span aria-hidden className="badge !bg-transparent ring-1 ring-current">{letter}</span>
            <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium uppercase tracking-wide opacity-80">{label}</span>
                <span className="block text-ui-text">{text}</span>
            </span>
            <Icon aria-hidden className="size-5 shrink-0" />
        </div>
    );
}

/**
 * Your result: stars, a summary of the score, and every answer reviewed
 * @since 8th October 2026
 */
export default function Results({ passage, review, study, title }: Props) {
    const questions = study?.questions ?? [];
    const correct = questions.filter((q, i) => review.answers[i] === q.correct).length;
    const date = parseReviewDate(review.date);
    const score = review.gradingResult && review.summary ? review.gradingResult.score : undefined;

    return (
        <div className="pb-16">
            <header className="mb-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="font-clue text-[32px] font-medium leading-tight">{title}</h1>
                    <span className="mt-2 flex shrink-0 items-center" role="img" aria-label={`${review.stars} of ${MAX_STARS} stars`}>
                        {Array.from({ length: MAX_STARS }, (_, i) => i < review.stars
                            ? <Star key={i} filled className="!size-6 !text-play-accent" />
                            : <StarIcon key={i} aria-hidden className="size-6 text-ui-faint" strokeWidth={1.5} />)}
                    </span>
                </div>
                {date ? (
                    <p className="mt-1 text-[14px] text-ui-muted">
                        Completed on {date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                ) : null}
            </header>

            {/* value above label, while keeping the label first for assistive technology */}
            <dl className="mb-8 grid grid-cols-3 border-y border-ui-line py-4 text-center [&>div]:flex [&>div]:flex-col-reverse">
                <div>
                    <dt className="text-[12px] text-ui-muted">Stars</dt>
                    <dd className="text-[22px] font-semibold tabular-nums" style={{ color: 'var(--reader-accent)' }}>{review.stars}/{MAX_STARS}</dd>
                </div>
                <div>
                    <dt className="text-[12px] text-ui-muted">Correct</dt>
                    <dd className="text-[22px] font-semibold tabular-nums">{study ? `${correct}/${questions.length}` : '–'}</dd>
                </div>
                <div>
                    <dt className="text-[12px] text-ui-muted">Summary</dt>
                    <dd className="text-[22px] font-semibold tabular-nums" style={score !== undefined ? { color: scoreTone(score) } : undefined}>
                        {score ?? '–'}
                    </dd>
                </div>
            </dl>

            <section aria-labelledby="review" className="-mx-4 rounded-t-3xl bg-ui-surface px-4 pb-8 pt-6 sm:mx-0 sm:rounded-3xl sm:px-6">
                <h2 id="review" className="text-[20px] font-semibold">Answers review</h2>
                <p className="mb-6 text-[14px] text-ui-muted">Your answers, and the right ones where they differ.</p>

                {!study ? (
                    <div className="reading-skeleton" role="status" aria-label="Loading review">
                        {[92, 70, 84, 60].map((w, i) => <span key={i} style={{ width: `${w}%` }} />)}
                    </div>
                ) : (
                    <ol className="grid gap-8">
                        {questions.map((q, i) => {
                            const options = optionsOf(q);
                            const chosen = review.answers[i];
                            const right = chosen === q.correct;
                            return (
                                <li key={i}>
                                    <p className="mb-3 flex gap-2 text-[15px] font-medium">
                                        <span className="tabular-nums text-ui-muted">{String(i + 1).padStart(2, '0')}</span>
                                        {q.content}
                                    </p>
                                    <div className="grid gap-2">
                                        {chosen ? (
                                            <Answer letter={LETTERS[options.indexOf(chosen)] ?? '–'} text={chosen} right={right}
                                                    label={right ? 'Your answer · correct' : 'Your answer'} />
                                        ) : null}
                                        {!right ? (
                                            <Answer letter={LETTERS[options.indexOf(q.correct)] ?? '–'} text={q.correct} right label="Correct answer" />
                                        ) : null}
                                    </div>
                                </li>
                            );
                        })}

                        <li>
                            <p className="mb-3 flex gap-2 text-[15px] font-medium">
                                <span className="tabular-nums text-ui-muted">{String(questions.length + 1).padStart(2, '0')}</span>
                                Your summary
                            </p>
                            {review.summary ? (
                                <>
                                    <p className="rounded-lg border border-ui-line bg-ui-bg p-3 text-[15px] leading-[1.6]">{review.summary}</p>
                                    {review.gradingResult?.message ? (
                                        <p className="mt-2 flex items-start gap-2 text-[13px]">
                                            <span className="shrink-0 rounded-full px-2 py-0.5 font-semibold tabular-nums"
                                                  style={{ color: scoreTone(review.gradingResult.score), background: `color-mix(in srgb, ${scoreTone(review.gradingResult.score)} 14%, transparent)` }}>
                                                {review.gradingResult.score}
                                            </span>
                                            <span className="text-ui-muted">{review.gradingResult.message}</span>
                                        </p>
                                    ) : null}
                                </>
                            ) : (
                                <p className="text-[14px] text-ui-muted">No summary written.</p>
                            )}
                            {study.goldenSummary ? (
                                <div className="mt-4 rounded-lg bg-ui-raised p-3">
                                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ui-muted">Model summary</p>
                                    <p className="font-clue text-[16px] leading-[1.6]">{study.goldenSummary}</p>
                                </div>
                            ) : null}
                        </li>
                    </ol>
                )}

                <div className="mt-10 grid grid-cols-2 gap-3">
                    <Link href={`/read/${passage}`} className="ui-button min-w-0">
                        <BookOpenIcon className="size-4 shrink-0" /><span className="truncate">Read {title}</span>
                    </Link>
                    <Link href="/study" className="ui-button reader-primary">All studies</Link>
                </div>
            </section>
        </div>
    );
}
