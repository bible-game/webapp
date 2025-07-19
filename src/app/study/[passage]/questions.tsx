'use client'

import React, {useEffect, useState} from 'react';
import {getStudy, Question} from '@/core/action/study/get-study';
import moment from "moment";
import {Spinner} from "@heroui/react";
import {Button} from "@nextui-org/react";
import TextareaAutosize from 'react-textarea-autosize';
import {gradeSummary} from '@/core/action/study/grade-summary';
import {useDebouncedCallback} from 'use-debounce';
import {StateUtil} from "@/core/util/state-util";
import {GradingResult, ReviewState} from "@/core/model/state/review-state";
import {post} from "@/core/action/http/post";

interface QuestionsProps {
  passage: string;
}

export default function Questions(props: any) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [stars, setStars] = useState(0);
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");
  const [gradingResult, setGradingResult] = useState<{ score: number; message: string } | null>(null);

  const debouncedGradeSummary = useDebouncedCallback((summary: string) => {
    gradeSummary(props.passage, summary).then((response) => {
      setGradingResult(response);
    });
  }, 1000);

  const handleSummaryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(event.target.value);
    debouncedGradeSummary(event.target.value);
  };

  const loadState = React.useCallback(() => {
    if (props.state) StateUtil.setAllReview(props.state);

    const state = StateUtil.getReview(props.passage);

    setSelectedAnswers(state.answers || []);
    setStars(state.stars || 0);
    setDate(state.date || "");
    setSummary(state.summary || "");
    setGradingResult(state.gradingResult || null);
    if (state.answers && state.answers.length > 0) {
      setSubmitted(true);
    }
  }, [props.passage]);


  useEffect(() => {
    loadState();
    getStudy(props.passage).then((response: any) => {
        setQuestions(response.questions);
        setLoading(false);
    });
  }, [props.passage, loadState]);

  const handleOptionChange = (questionIndex: number, option: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = option;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);

    let finalStars = questions.reduce((acc: number, q: any, index: number) => {
      if (selectedAnswers[index] === q.correct) {
        return acc + 1;
      }
      return acc;
    }, 0);
    if (gradingResult && gradingResult.score > 60) {
      finalStars += 1;
    }

    const date = moment(new Date()).format('dddd, MMMM Do YYYY, h:mm:ss a').toString();
    setStars(finalStars);
    setDate(date);
    if (!gradingResult) setGradingResult({score: 0, message: ''});
    const state: ReviewState = {stars: finalStars, answers: selectedAnswers, passageKey: props.passage, date, summary, gradingResult: gradingResult as GradingResult}
    if (props.state) post(`${process.env.SVC_USER}/state/review`, state)
    StateUtil.setReview(state);
  };

  const getScoreColor = (score: number) => {
    if (score > 60) {
      return 'bg-gradient-to-tr from-green-50 to-green-100 border-1 border-green-300';
    }
    if (score > 40) {
      return 'bg-gradient-to-tr from-amber-50 to-amber-100 border-1 border-amber-300';
    }
    return 'bg-gradient-to-tr from-red-50 to-red-100 border-1 border-red-300';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Spinner color="primary" />
            </div>
        ) : (
            <>
              <div className="flex items-center">
                {[...Array(stars)].map((i: any, index: any) =>
                    <svg key={'star'+index} xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24"
                         strokeWidth="1.5"
                         stroke="gold" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                    </svg>
                )}
                {[...Array(1 + questions.length - stars)].map((i: any, index: number) =>
                    <div className="opacity-20" key={'blank'+index}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#D9D9D9" viewBox="0 0 24 24"
                           strokeWidth="1.5"
                           stroke="#D9D9D9" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                      </svg>
                    </div>
                )}
                <p className="font-extralight text-xs text-gray-500 ml-4">{date}</p>
              </div>
              {questions.map((q: any, questionIndex: any) => (
                <div
                  key={questionIndex}
                  className={`p-2 my-12 rounded transition-all duration-300 ${
                    submitted
                      ? selectedAnswers[questionIndex] === q.correct
                        ? 'bg-gradient-to-tr from-green-50 to-green-100 border-1 border-green-300'
                        : 'bg-gradient-to-tr from-red-50 to-red-100 border-1 border-red-300'
                      : 'bg-white border-1 border-gray-200'
                  }`}>
                  <p className="p-4 font-medium text-[14px] text-gray-800">{q.content}</p>
                  <div className="">
                    {[q.optionOne, q.optionTwo, q.optionThree].map((option: any, optionIndex: any) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`question-${questionIndex}-option-${optionIndex}`}
                          name={`question-${questionIndex}`}
                          value={option}
                          checked={selectedAnswers[questionIndex] === option}
                          onChange={() => handleOptionChange(questionIndex, option)}
                          className="hidden peer"
                          disabled={submitted}
                        />
                        <label
                          htmlFor={`question-${questionIndex}-option-${optionIndex}`}
                          className={`text-sm flex items-center justify-between w-full p-4 rounded cursor-pointer peer-checked:text-blue-800 hover:translate-x-0.5 duration-250 text-gray-600 peer-checked:font-bold ${
                            submitted && selectedAnswers[questionIndex] !== q.correct && option === q.correct
                              ? 'bg-gradient-to-tr from-blue-50 to-blue-100 border-1 border-blue-300 text-blue-800'
                              : 'font-light opacity-80'
                          } ${
                              submitted && selectedAnswers[questionIndex] === q.correct && option === q.correct
                                  ? '!text-green-900'
                                  : ''
                          } ${
                            submitted && selectedAnswers[questionIndex] !== q.correct && option !== q.correct
                            ? '!text-red-900'
                            : ''
                          }`}
                        >
                          <span>{option}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="p-2 my-12 rounded transition-all duration-300 bg-white border-1 border-gray-200">
                <p className="p-4 font-medium text-[14px] text-gray-800">Summarise the passage in your own words</p>
                <TextareaAutosize
                  value={summary}
                  onChange={handleSummaryChange}
                  minRows={4}
                  className="my-4 w-full px-4 rounded-md bg-white text-sm text-gray-800 focus:outline-none font-light"
                  placeholder="Example: Paul encourages the church to value unity within diversity. He explains that spiritual gifts come from the same Spirit and are given to help the whole church. Using the metaphor of the human body, he teaches that each member is essential, no matter their role..."
                  disabled={submitted}
                />
                {gradingResult && (
                  <div className={`p-4 rounded-md ${getScoreColor(gradingResult.score)}`}>
                    <p className="text-sm text-gray-600">{gradingResult.message}</p>
                  </div>
                )}
              </div>
              {
                !stars ? <Button onPress={handleSubmit} className="rounded mb-[8rem] mt-2 bg-gradient-to-tr from-blue-700 to-blue-800 text-white"
                                 disabled={submitted}>Submit</Button> : <></>
              }
            </>
        )}
    </div>
  );
};