"use client"

import React from "react";
import { Card, CardBody } from "@nextui-org/card";

enum Closeness {
    _UN = 'text-white',
    _00 = 'text-transparent bg-clip-text bg-gradient-to-b from-danger-200 to-danger-500',
    _50 = 'text-transparent bg-clip-text bg-gradient-to-b from-warning-200 to-warning-600',
    _75 = 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600',
    _85 = 'text-transparent bg-clip-text bg-gradient-to-b from-success-200 to-success-600',
    _95 = 'text-transparent bg-clip-text bg-gradient-to-b from-teal-200 to-teal-600'
}

const Guess = (props: any) => {
    const [colour] = React.useState(grade(props.closeness));
    const [passage] = React.useState(format(props.book, props.chapter));

    function grade(closeness: any): string {
        if (!!closeness) {
            closeness = parseInt(closeness.slice(0, -1));

            if (closeness >= 95) return Closeness._95
            if (closeness >= 85) return Closeness._85
            if (closeness >= 75) return Closeness._75
            if (closeness >= 50) return Closeness._50
            if (closeness >= 0)  return Closeness._00
        }

        return Closeness._UN
    }

    function format(book: any, chapter: any): string {
        if (!!book && !!chapter) {
            switch (book) {
                case 'Song of Solomon':
                    return `Sg. Solomon ${chapter}`;
                case '1 Thessalonians':
                    return `1 Thessalon. ${chapter}`;
                case '2 Thessalonians':
                    return `2. Thessalon ${chapter}`;
                case '1 Corinthians':
                    return `1 Corinth. ${chapter}`;
                case '2 Corinthians':
                    return `2 Corinth. ${chapter}`;
                default:
                    return `${book} ${chapter}`
            }
        }

        return ""
    }

    return  <Card className="flex flex-1 p-4 justify-around bg-opacity-30 bg-gray-800 text-white h-[3.5rem]">
                <CardBody>
                    <div className="flex justify-between">
                        <div className="flex items-center"><p className="text-xs">{passage}</p></div>
                        <div className="text-right text-sm"><p className={colour}>{props.closeness}</p></div>
                    </div>
                </CardBody>
            </Card>
}

export default Guess;