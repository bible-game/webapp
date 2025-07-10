'use client'

import React, { useState } from 'react';
import { Question } from '@/core/action/get-study';

interface QuestionsProps {
  questions: Question[];
}

const Questions: React.FC<QuestionsProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleOptionChange = (questionIndex: number, option: string) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = option;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {questions.map((q, questionIndex) => (
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
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
        disabled={submitted}
      >
        Submit
      </button>
    </div>
  );
};

export default Questions;