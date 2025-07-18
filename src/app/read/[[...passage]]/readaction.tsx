"use client"

import { Button } from "@nextui-org/react";
import React from "react";
import { toast, Toaster } from "react-hot-toast";
import { StateUtil } from "@/core/util/state-util";

const ReadAction = (props: any) => {

    function tickRead() {
        const chapter = props.chapter || 1;
        const state = {book: props.book, chapter, verseStart: props.verseStart, verseEnd: props.verseEnd}
        StateUtil.setRead(state);

        if (props.state) {
            // todo :: trigger backend read update
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

    return <>
        <Toaster position="bottom-right"/>
        <Button
            onPress={tickRead}
            className="text-blue-600 h-[66px] text-sm rounded-none border-[#ffffff40] mt-8"
            variant="bordered">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 strokeWidth={1.25} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
            </svg>
            Tick Read
        </Button>
    </>
}

export default ReadAction;