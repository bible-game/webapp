"use server"

import React from "react";
import Navigation from "@/app/navigation";
import Content from "@/app/read/[[...passage]]/content";
import { getReadState } from "@/core/action/state/get-state-read";
import { ReadState } from "@/core/model/state/read-state";
import isLoggedIn from "@/core/util/auth-util";
import getUserInfo, {UserInfo} from "@/core/action/user/get-user-info";

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
                    <Navigation stats={true} play={true} dark={true} authenticated={!!state} displayName={info?.firstname}/>
                    <main className="bg-white h-min w-full text-black relative top-[6rem] overflow-auto pb-[12rem] flex justify-center">
                        <Content passageKey={passage} state={state}/>
                    </main>
                </div>
            </div>
    );
}