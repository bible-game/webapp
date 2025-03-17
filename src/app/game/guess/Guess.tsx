"use client"

import React from "react";
import { Card, CardBody } from "@nextui-org/card";

enum Closeness {
    UNKNOWN = 'text-white',
    VERY_FAR = 'text-transparent bg-clip-text bg-gradient-to-b from-danger-200 to-danger-500',
    FAR = 'text-transparent bg-clip-text bg-gradient-to-b from-warning-200 to-warning-600',
    MEDIUM = 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600',
    CLOSE = 'text-transparent bg-clip-text bg-gradient-to-b from-lime-200 to-lime-600',
    VERY_CLOSE = 'text-transparent bg-clip-text bg-gradient-to-b from-success-200 to-success-600'
}

const Guess = (props: any) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });

    const [colour] = React.useState(grade(props.closeness));
    const [passage] = React.useState(formatPassage(props.book, props.chapter));
    const [closeness] = React.useState(formatCloseness(props.closeness));

    function grade(closeness: any): string {
        if (!!closeness) {
            closeness = parseInt(closeness.distance);
            // note :: closeness now defined as verse distance; % closeness is ratio to total verses
            // todo :: offer tooltip for score calculation (1+limit-guesses).(% closeness)

            if (closeness <= 100) return Closeness.VERY_CLOSE
            if (closeness <= 500) return Closeness.CLOSE
            if (closeness <= 2500) return Closeness.MEDIUM
            if (closeness <= 10000) return Closeness.FAR
            else return Closeness.VERY_FAR
        }

        return Closeness.UNKNOWN
    }

    // TODO :: extra to service-layer and apply to answer chip too!?
    function formatPassage(book: any, chapter: any): string {
        if (!!book && !!chapter) {
            switch (book) {
                // case 'Song of Solomon':
                //     return `Sg. Solomon ${chapter}`;
                // case '1 Thessalonians':
                //     return `1 Thessalon. ${chapter}`;
                // case '2 Thessalonians':
                //     return `2 Thessalon ${chapter}`;
                // case '1 Corinthians':
                //     return `1 Corinth. ${chapter}`;
                // case '2 Corinthians':
                //     return `2 Corinth. ${chapter}`;
                default:
                    return `${book} ${chapter}`
            }
        }

        return ""
    }

    function formatCloseness(closeness: any): string {
        if (!!closeness) {
            const distance = parseInt(closeness.distance);
            return distance == 0 ? '🎉' : formatter.format(distance);

        } else return '';
    }

    return <div className="panel dot p-2 justify-between text-white">
        <div className="flex items-center">
            <p className="text-xs"><span className={"ml-1 mr-2 " + colour}>&#9679;</span>{passage}</p>
            <p className={"mx-2 text-xs " + colour}>{closeness}</p>
        </div>
    </div>
}

export default Guess;