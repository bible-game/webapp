"use client"

import { Button } from "@nextui-org/react";
import React from "react";
import {GameStatesService} from "@/core/service/game-states-service";

const ReadAction = (props: any) => {

    function tickRead() {
        GameStatesService.updateCompletion(props.book, props.chapter, true)
    }

    return <Button
        onClick={tickRead}
        className="text-purple-600 h-[66px] text-sm rounded-none border-[#ffffff40] mt-8"
        variant="bordered">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             strokeWidth={1.25} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
        </svg>
        Tick Read
    </Button>
}

export default ReadAction;