"use client"

import { useEffect, useState } from "react";
import { StateUtil } from "@/core/util/state-util";
import { post } from "@/core/action/http/post";
import getReadKey, { ReadState } from "@/core/model/state/read-state";

type ReadPassage = {
    book: string;
    chapter: string | number;
    verseStart?: string | number;
    verseEnd?: string | number;
    state?: Map<string, ReadState>;
};

/** Read state for a passage, and marking it read (locally, and remotely when logged in) */
export function useReadAction(props: ReadPassage) {
    const chapter = String(props.chapter || 1);
    const verseStart = props.verseStart ? String(props.verseStart) : "";
    const verseEnd = props.verseEnd ? String(props.verseEnd) : "";
    const readKey = getReadKey({ book: props.book, chapter, verseStart, verseEnd, passageKey: "" });
    const [read, setRead] = useState(false);

    useEffect(() => {
        setRead(!!StateUtil.getRead(readKey).passageKey || !!props.state?.has?.(readKey));
    }, [readKey, props.state]);

    function markRead() {
        const state = { book: props.book, chapter, verseStart, verseEnd, passageKey: readKey };
        StateUtil.setRead(state);
        setRead(true);

        if (props.state) {
            post(`${process.env.SVC_USER}/state/read`, state).then();
        }
    }

    return { read, markRead };
}
