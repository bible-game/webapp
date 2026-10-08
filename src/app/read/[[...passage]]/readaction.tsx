"use client"

import { Button } from "@heroui/react";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { StateUtil } from "@/core/util/state-util";
import { post } from "@/core/action/http/post";
import getReadKey from "@/core/model/state/read-state";
import { CheckCircle2, Circle } from "lucide-react";

const ReadAction = (props: any) => {
    const chapter = props.chapter || 1;
    const readKey = getReadKey({
        book: props.book,
        chapter,
        verseStart: props.verseStart || "",
        verseEnd: props.verseEnd || "",
        passageKey: "",
    });
    const [read, setRead] = useState(false);

    useEffect(() => {
        setRead(!!StateUtil.getRead(readKey).passageKey || !!props.state?.has?.(readKey));
    }, [readKey, props.state]);

    function tickRead() {
        const state = {
            book: props.book,
            chapter,
            verseStart: props.verseStart || "",
            verseEnd: props.verseEnd || "",
            passageKey: readKey,
        };
        StateUtil.setRead(state);
        setRead(true);

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
            <Toaster position="bottom-center" />
            <Button
                onPress={tickRead}
                aria-pressed={read}
                className={read
                    ? "ui-button !border-[#78ad88] !bg-[#e6f1e9] !text-[#2f6a42]"
                    : "ui-button ui-primary"}>
                {read ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                {read ? "Read" : "Mark as read"}
            </Button>
        </>
    );
};

export default ReadAction;
