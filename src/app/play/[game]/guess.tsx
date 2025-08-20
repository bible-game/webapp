"use client"

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

enum Closeness {
    UNKNOWN = 'text-white',
    VERY_FAR = 'text-transparent bg-clip-text bg-gradient-to-b from-danger-200 to-danger-600',
    FAR = 'text-transparent bg-clip-text bg-gradient-to-b from-orange-200 to-orange-600',
    MEDIUM = 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600',
    CLOSE = 'text-transparent bg-clip-text bg-gradient-to-b from-lime-200 to-lime-600',
    VERY_CLOSE = 'text-transparent bg-clip-text bg-gradient-to-b from-success-200 to-success-600'
}

const Guess = (props: any) => {
    const formatter = Intl.NumberFormat("en", { notation: "compact" });

    const [colour] = useState(grade(props.closeness));
    const [passage] = useState(formatPassage(props.book, props.chapter));
    const [closeness] = useState(formatCloseness(props.closeness));

    function grade(closeness: any): string {
        if (closeness) {
            closeness = Math.abs(parseInt(closeness.distance));
            // note :: closeness now defined as verse distance; % closeness is ratio to total verses

            if (closeness <= 100) return Closeness.VERY_CLOSE
            if (closeness <= 500) return Closeness.CLOSE
            if (closeness <= 2000) return Closeness.MEDIUM
            if (closeness <= 5000) return Closeness.FAR
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
                    return `${book.substring(0, book.split(" ").length > 1 ? 4 : 3).toUpperCase()} ${chapter}`
            }
        }

        return ""
    }

    function formatCloseness(closeness: any): string {
        if (!!closeness) {
            const distance = parseInt(closeness.distance);
            return distance == 0 ? '🎉' : formatter.format(Math.abs(distance));

        } else return '';
    }

    return <div className="p-1 justify-between text-white">
        <div className="flex items-center">
            {closeness == '🎉' ? '' : props.closeness.distance.toString().includes('-') ? <ChevronDown size={16}/> : <ChevronUp size={16}/> }
            <p className={"text-[12px] " + (closeness == '🎉' ? 'ml-3' : 'ml-1')}>{passage}</p>
            <p className={"ml-2 mr-3 text-[12px] " + colour}>{closeness}</p>
        </div>
    </div>
}

export default Guess;