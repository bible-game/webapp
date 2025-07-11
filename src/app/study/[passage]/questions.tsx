'use client'

import React, { useEffect, useState } from 'react';
import { Question } from '@/core/action/get-study';
import { GameStatesService } from "@/core/service/game-states-service";
import moment from "moment";

interface QuestionsProps {
  questions: Question[];
}

export default function Questions(props: any) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [stars, setStars] = useState(0);
  const [date, setDate] = useState("");

  useEffect(() => {
    loadState();
  }, [props.passage]);

  function loadState() {
    const state = GameStatesService.getStudy(props.passage)
    setSelectedAnswers(state.answers || []);
    setStars(state.stars || 0);
    setDate(state.date || "");
    if (state.answers && state.answers.length > 0) {
      setSubmitted(true);
    }
  }

  const handleOptionChange = (questionIndex: number, option: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = option;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const correctAnswers = props.questions.reduce((acc: number, q: any, index: number) => {
      if (selectedAnswers[index] === q.correct) {
        return acc + 1;
      }
      return acc;
    }, 0);

    GameStatesService.setStudy(correctAnswers, selectedAnswers, props.passage, moment(new Date()).format('dddd, MMMM Do YYYY, h:mm:ss a').toString());
    loadState();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center">
        {[...Array(stars)].map((i: any) =>
            <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24"
                 strokeWidth="1.5"
                 stroke="gold" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
            </svg>
        )}
        {[...Array(props.questions.length - stars)].map((i: any) =>
            <div className="opacity-20" key={i}>
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
      {props.questions.map((q: any, questionIndex: any) => (
        <div key={questionIndex} className="my-4 p-4 border rounded-lg">
          <p className="font-bold">{q.content}</p>
          <div className="my-2">
            {[q.optionOne, q.optionTwo, q.optionThree].map((option: any, optionIndex: any) => (
              <div key={optionIndex} className="flex items-center my-1">
                <input
                  type="radio"
                  id={`question-${questionIndex}-option-${optionIndex}`}
                  name={`question-${questionIndex}`}
                  value={option}
                  checked={selectedAnswers[questionIndex] === option}
                  onChange={() => handleOptionChange(questionIndex, option)}
                  className="mr-2"
                  disabled={submitted}
                />
                <label htmlFor={`question-${questionIndex}-option-${optionIndex}`}>{option}</label>
              </div>
            ))}
          </div>
          {submitted && (
            <p className={`text-sm ${selectedAnswers[questionIndex] === q.correct ? 'text-green-600' : 'text-red-600'}`}>
              {selectedAnswers[questionIndex] === q.correct ? 'Correct!' : `Incorrect. The correct answer is ${q.correct}`}
            </p>
          )}
        </div>
      ))}
      {
        !stars ? <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
                        disabled={submitted}>Submit</button> : <></>
      }

    </div>
  );
};