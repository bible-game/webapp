"use client"

import React from "react";
import {Card, CardBody} from "@nextui-org/card";
import {Button} from "@nextui-org/react";

const Results = (props: any) => {
    let score: any = 0;
    for (const guess of props.guesses) {
        const closeness = +guess.closeness.percentage
        if (closeness > score) score = closeness;
    }

    if (score == 100) {
        score = `Well Done! ${5 + 1 - props.guesses.length} ⭐`;
    } else {
        score = `Well Done! ${score/100} ⭐`
    }

    const result = `
${score} ⭐
https://bible.game
${props.today}`;

    return <div className="text-xs flex gap-2 items-center cursor-pointer" onClick={() => {navigator.clipboard.writeText(result)}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5"><path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z"/><path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z"/></svg>
        <p className="leading-[1.25rem]">{score}</p>
    </div>
}

export default Results;