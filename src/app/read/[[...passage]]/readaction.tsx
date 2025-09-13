"use client"

import { Button } from "@nextui-org/react";
import React from "react";
import { toast, Toaster } from "react-hot-toast";
import { StateUtil } from "@/core/util/state-util";
import { post } from "@/core/action/http/post";
import getReadKey from "@/core/model/state/read-state";
import { CheckCircle2 } from "lucide-react";

const ReadAction = (props: any) => {
    function tickRead() {
        const chapter = props.chapter || 1;
        const state = {
            book: props.book,
            chapter,
            verseStart: props.verseStart || "",
            verseEnd: props.verseEnd || "",
            passageKey: "",
        };
        state.passageKey = getReadKey(state);
        StateUtil.setRead(state);

        if (props.state) {
            post(`${process.env.SVC_USER}/state/read`, state).then();
        }

        if (props.verseStart) {
            if (props.verseEnd) {
                toast.success(`${props.book} ${chapter} : ${props.verseStart} - ${props.verseEnd}`);
            } else {
                toast.success(`${props.book} ${chapter} : ${props.verseStart}`);
            }
        } else {
            toast.success(`${props.book} ${chapter}`);
        }
    }

    return (
        <>
            <Toaster position="bottom-right" />
            <Button
                onPress={tickRead}
                aria-label="Mark as read"
                className="rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow hover:brightness-110">
                <CheckCircle2 className="size-4" />
                <span className="ml-1">Tick Read</span>
            </Button>
        </>
    );
};

export default ReadAction;