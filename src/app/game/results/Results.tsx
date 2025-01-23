"use client"

import React from "react";
import {Card, CardBody} from "@nextui-org/card";
import {Button} from "@nextui-org/react";

const Results = (props: any) => {
    let score: any = 0;
    for (const guess of props.guesses) {
        const closeness = +guess.closeness.substring(0,guess.closeness.length-1)
        if (closeness > score) score = closeness;
    }

    if (score == 100) {
        score = `Well Done! ${100 * (3 + 1 - props.guesses.length)} ⭐`;
    } else {
        score = `Close! You scored ${score} ⭐`
    }

    const result = `
        ${props.today}
        ${score} ⭐
        https://bible.game
    `;


    return <Card className="max-w-full flex justify-center mt-8 px-8 py-4 bg-opacity-30 bg-blue-950 text-white">
        <CardBody>
            <div className="flex justify-between">
                <div className="flex items-center"><div><p className="text-sm">{props.book} {props.chapter} - {props.title}</p></div></div>
                <div className="text-right flex items-center gap-4">
                    <div><p className="text-sm">{score}</p></div>
                    <Button onClick={() => {navigator.clipboard.writeText(result)}}>Share</Button>
                </div>
            </div>
        </CardBody>
    </Card>
}

export default Results;