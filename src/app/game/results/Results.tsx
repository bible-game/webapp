"use client"

import React from "react";
import {Card, CardBody} from "@nextui-org/card";
import {Button} from "@nextui-org/react";

const Results = (props: any) => {
    let score = 0;
    for (const guess of props.guesses) {
        const closeness = +guess.closeness.substring(0,guess.closeness.length-1)
        if (closeness > score) score = closeness;
    }

    if (score == 100) {
        score *= (3 + 1 - props.guesses.length);
    }

    const result = `
        ${props.today}
        ${score} ⭐
        https://bible.game
    `;


    return <Card className="max-w-full flex justify-center mt-4 px-8 py-4 bg-opacity-60 bg-gray-800 text-white">
        <CardBody>
            <div className="flex justify-between">
                <div className="w-[20rem] flex items-center"><div><p>{props.book} {props.chapter}: {props.title}</p></div></div>
                <div className="w-[15rem] text-center flex items-center"><div><p>{score} ⭐</p></div></div>
                <div className="w-[10rem] text-right">
                    <Button onClick={() => {navigator.clipboard.writeText(result)}}>Share</Button>
                </div>
            </div>
        </CardBody>
    </Card>
}

export default Results;