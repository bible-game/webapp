'use client'

import React, {useEffect, useState} from 'react';
import {getStudy, Question} from '@/core/action/study/get-study';
import moment from 'moment';
import {Spinner} from '@heroui/react';
import {Button} from '@nextui-org/react';
import TextareaAutosize from 'react-textarea-autosize';
import {gradeSummary} from '@/core/action/study/grade-summary';
import {useDebouncedCallback} from 'use-debounce';
import {StateUtil} from '@/core/util/state-util';
import {ReviewState} from '@/core/model/state/review-state';
import {post} from '@/core/action/http/post';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface QuestionsProps {
  passage: string;
  state?: Map<string, ReviewState>;
}

export default function Questions(props: QuestionsProps & any) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [stars, setStars] = useState(0);
  const [date, setDate] = useState('');

  const [summary, setSummary] = useState('');
  const [gradingResult, setGradingResult] = useState<{ score: number; message: string } | null>(null);

  const debouncedGradeSummary = useDebouncedCallback((text: string) => {
    gradeSummary(props.passage, text).then((response) => {
      setGradingResult(response);
    });
  }, 800);

  const handleSummaryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(event.target.value);
    debouncedGradeSummary(event.target.value);
  };

  const loadState = React.useCallback(() => {
    if (props.state) StateUtil.setAllReviews(props.state);
    const state = StateUtil.getReview(props.passage) || {} as ReviewState;

    setSelectedAnswers(state.answers || []);
    setStars(state.stars || 0);
    setDate(state.date || '');
    setSummary(state.summary || '');
    setGradingResult(state.gradingResult || null);
    if (state.answers && state.answers.length > 0) {
      setSubmitted(true);
    }
  }, [props.passage, props.state]);

  useEffect(() => {
    loadState();
    getStudy(props.passage).then((response: any) => {
      setQuestions(response.questions as Question[]);
      setLoading(false);
    });
  }, [props.passage, loadState]);

  const handleOptionChange = (questionIndex: number, option: string) => {
    const next = [...selectedAnswers];
    next[questionIndex] = option;
    setSelectedAnswers(next);
  };

  const handleSubmit = () => {
    setSubmitted(true);

    let finalStars = questions.reduce((acc: number, q: any, index: number) => {
      if (selectedAnswers[index] === q.correct) return acc + 1;
      return acc;
    }, 0);

    if (gradingResult && gradingResult.score > 60) finalStars += 1; // summary star

    const formatted = moment(new Date()).format('dddd, MMMM Do YYYY, h:mm:ss a').toString();
    setStars(finalStars);
    setDate(formatted);

    const state: ReviewState = {
      stars: finalStars,
      answers: selectedAnswers,
      passageKey: props.passage,
      date: formatted,
      summary,
      gradingResult: gradingResult || {score: 0, message: ''},
    };

    if (props.state) post(`${process.env.SVC_USER}/state/review`, state);
    StateUtil.setReview(state);
  };

  const getScoreTint = (score: number) => {
    if (score > 60) return 'bg-emerald-50 ring-1 ring-emerald-200';
    if (score > 40) return 'bg-amber-50 ring-1 ring-amber-200';
    return 'bg-rose-50 ring-1 ring-rose-200';
  };

  const isCorrect = (q: any, option: string) => option === q.correct;
  const isChosen = (idx: number, option: string) => selectedAnswers[idx] === option;

  const optionClass = (q: any, qIndex: number, option: string) => {
    // Base
    let cls = 'w-full p-3 sm:p-3.5 rounded-xl border text-sm transition hover:border-slate-300 bg-white/90';
    cls += ' peer-checked:ring-1 peer-checked:ring-indigo-600 peer-checked:border-indigo-300';

    if (!submitted) return cls + ' text-slate-700';

    // After submit: show correct/incorrect tints
    if (isCorrect(q, option)) {
      return cls + ' border-emerald-300 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-900';
    }
    if (isChosen(qIndex, option)) {
      return cls + ' border-rose-300 bg-gradient-to-r from-rose-100 to-rose-50 text-rose-900';
    }
    return cls + ' text-slate-600 opacity-70';
  };

  return (
      <div className="w-full max-w-3xl mx-auto">
        {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" />
            </div>
        ) : (
            <>
              {questions.map((q: any, qi: number) => (
                  <div
                      key={qi}
                      className={`mb-6 rounded-2xl bg-white/90 ring-1 ring-slate-200 overflow-hidden transition ${
                          submitted
                              ? isCorrect(q, selectedAnswers[qi])
                                  ? 'ring-emerald-200 bg-emerald-50'
                                  : 'ring-rose-200 bg-rose-50'
                              : 'hover:ring-slate-300'
                      }`}
                  >
                    <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-start gap-2">
                      {submitted ? (
                          isCorrect(q, selectedAnswers[qi]) ? (
                              <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                          ) : (
                              <XCircle className="mt-0.5 size-5 text-rose-600" />
                          )
                      ) : (
                          <HelpCircle className="mt-0.5 size-5 text-slate-400" />
                      )}
                      <p className="font-medium text-[15px] text-slate-900">{q.content}</p>
                    </div>

                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
                      {[q.optionOne, q.optionTwo, q.optionThree].map((option: string, oi: number) => (
                          <div key={oi} className="flex items-center">
                            <input
                                type="radio"
                                id={`q-${qi}-opt-${oi}`}
                                name={`q-${qi}`}
                                value={option}
                                checked={selectedAnswers[qi] === option}
                                onChange={() => handleOptionChange(qi, option)}
                                className="hidden peer"
                                disabled={submitted}
                            />
                            <label
                                htmlFor={`q-${qi}-opt-${oi}`}
                                className={optionClass(q, qi, option)}
                            >
                              <span>{option}</span>
                            </label>
                          </div>
                      ))}
                    </div>
                  </div>
              ))}

              {/* Summary */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-slate-200 p-4 sm:p-5">
                <p className="font-medium text-[15px] text-slate-900">
                  Summarise the passage in your own words
                </p>
                <TextareaAutosize
                    value={summary}
                    onChange={handleSummaryChange}
                    minRows={4}
                    className="mt-3 w-full px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-indigo-300 focus:outline-none text-sm text-slate-800"
                    placeholder="Example: Paul encourages the church to value unity within diversity. He explains that spiritual gifts come from the same Spirit and are given to help the whole church. Using the metaphor of the human body, he teaches that each member is essential, no matter their role..."
                    disabled={submitted}
                />
                {gradingResult && (
                    <div className={`mt-3 p-3 rounded-xl text-sm text-slate-700 ${getScoreTint(gradingResult.score)}`}>
                      {gradingResult.message}
                    </div>
                )}
              </div>

              {/* Submit */}
              {!stars && (
                  <Button
                      onPress={handleSubmit}
                      className="rounded-xl mt-4 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow hover:brightness-110"
                      disabled={submitted}
                  >
                    Submit
                  </Button>
              )}
            </>
        )}
      </div>
  );
}
