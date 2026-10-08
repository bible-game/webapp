'use client'

import React, {useEffect, useState} from 'react';
import {getStudy, Question} from '@/core/action/study/get-study';
import moment from 'moment';
import {Spinner} from '@heroui/react';
import {Button} from '@heroui/react';
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
  const [isGrading, setIsGrading] = useState(false);

  const debouncedGradeSummary = useDebouncedCallback((text: string) => {
    setIsGrading(true);
    gradeSummary(props.passage, text).then((response) => {
      setGradingResult(response);
      setIsGrading(false);
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

    if (gradingResult && gradingResult.score > 60) finalStars += 1;

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

    props.update(state);
  };

  const getScoreTint = (score: number) => {
    if (score > 60) return 'bg-ui-won/10 ring-1 ring-ui-won/40';
    if (score > 40) return 'bg-ui-amber/10 ring-1 ring-ui-amber/40';
    return 'bg-ui-lost/10 ring-1 ring-ui-lost/40';
  };

  const isCorrect = (q: any, option: string) => option === q.correct;
  const isChosen = (idx: number, option: string) => selectedAnswers[idx] === option;

  const optionClass = (q: any, qIndex: number, option: string) => {
    // Base
    let cls = 'w-full p-3 sm:p-3.5 rounded-lg border border-ui-line text-sm transition bg-ui-surface';
    cls += ' peer-checked:ring-1 peer-checked:ring-ui-muted peer-checked:border-ui-muted peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ui-text peer-focus-visible:outline-offset-2';

    if (!submitted) return cls + ' text-ui-text cursor-pointer hover:bg-ui-raised';

    // After submit: show correct/incorrect tints
    if (isCorrect(q, option)) {
      return cls + ' !border-ui-won/60 !bg-ui-won/10 text-ui-won';
    }
    if (isChosen(qIndex, option)) {
      return cls + ' !border-ui-lost/60 !bg-ui-lost/10 text-ui-lost';
    }
    return cls + ' text-ui-muted';
  };

    const allQuestionsAnswered = selectedAnswers.filter(a => a).length === questions.length;

  return (
      <div className="w-full max-w-3xl mx-auto pb-24">
        {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" />
            </div>
        ) : (
            <>
              {questions.map((q: any, qi: number) => (
                  <div
                      key={qi}
                      className="mb-8 border-b border-ui-line pb-6"
                  >
                    <div className="pb-4 flex items-start gap-2">
                      {submitted ? (
                          isCorrect(q, selectedAnswers[qi]) ? (
                              <CheckCircle2 className="mt-0.5 size-5 text-ui-won" />
                          ) : (
                              <XCircle className="mt-0.5 size-5 text-ui-lost" />
                          )
                      ) : (
                          <HelpCircle className="mt-0.5 size-5 text-ui-faint" />
                      )}
                      <p className="font-medium text-[15px] text-ui-text">{q.content}</p>
                    </div>

                    <div className="space-y-2">
                      {[q.optionOne, q.optionTwo, q.optionThree].map((option: string, oi: number) => (
                          <div key={oi} className="flex items-center">
                            <input
                                type="radio"
                                id={`q-${qi}-opt-${oi}`}
                                name={`q-${qi}`}
                                value={option}
                                checked={selectedAnswers[qi] === option}
                                onChange={() => handleOptionChange(qi, option)}
                                className="sr-only peer"
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
              <div className="py-2">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-[15px] text-ui-text">
                      Summarise the passage in your own words
                    </p>
                    {isGrading && <Spinner color="primary" size="sm" />}
                </div>
                <TextareaAutosize
                    value={summary}
                    onChange={handleSummaryChange}
                    minRows={4}
                    aria-label="Passage summary"
                    className="ui-field mt-3 text-sm"
                    placeholder="Example: Paul encourages the church to value unity within diversity. He explains that spiritual gifts come from the same Spirit and are given to help the whole church. Using the metaphor of the human body, he teaches that each member is essential, no matter their role..."
                    disabled={submitted}
                />
                {gradingResult && (
                    <div className={`mt-3 p-3 rounded-lg text-sm text-ui-text ${getScoreTint(gradingResult.score)}`}>
                        <span className="font-semibold">Score: {gradingResult.score}/100</span> - {gradingResult.message}
                    </div>
                )}
              </div>
                <div className="fixed bottom-0 left-0 right-0 bg-ui-bg border-t border-ui-line px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
                    <div className="max-w-3xl mx-auto flex justify-end">
                        <Button
                            onPress={handleSubmit}
                            className="ui-button ui-primary"
                            disabled={submitted || !allQuestionsAnswered}>
                            {submitted ? 'Completed' : 'Submit'}
                        </Button>
                    </div>
                </div>
            </>
        )}
      </div>
  );
}
