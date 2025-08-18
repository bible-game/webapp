"use server"

import React from "react";
import Menu from "@/app/menu";
import Content from "@/app/read/[[...passage]]/content";
import { getReadState } from "@/core/action/state/get-state-read";
import { ReadState } from "@/core/model/state/read-state";
import isLoggedIn from "@/core/util/auth-util";
import getUserInfo, {UserInfo} from "@/core/action/user/get-user-info";
import {parseDate} from "@internationalized/date";

/**
 * Read Passage Page
 * @since 12th April 2025
 */
export default async function Read({params}: { params: Promise<{ passage: string | undefined }>}) {

    const { passage } = await params;

    let info: UserInfo | undefined;
    let state: Map<string,ReadState> | undefined;
    if (await isLoggedIn()) {
        state = await getReadState();
        info = await getUserInfo();
    }

    return (
            <div className="bg-white absolute top-0 left-0 w-full h-full">
                <div className="flex justify-center">
                    <main className="bg-white h-min w-full text-black relative overflow-auto pb-[12rem] flex justify-center">
                        <div>
                            <Menu isPlay={false} info={info} dark={true}/>
                            <Content passageKey={passage} state={state}/>
                        </div>
                    </main>
                </div>
            </div>
    );
}