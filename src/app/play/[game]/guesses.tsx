"use client"

import React from "react";
import Guess from "@/app/play/[game]/guess";
import { Star } from "@/app/play/[game]/star";

const Guesses = (props: any) => {

    return <section className="!w-full pb-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-0 sm:grid-cols-1">
        {props.guesses.map((guess: any) => <Guess book={guess.bookKey || guess.book} key={guess.book + guess.chapter}
                                            chapter={guess.chapter}
                                            bookFound={props.bookFound}
                                            closeness={guess.closeness}/>)}
        </div>
        {props.device != 'mobile' ? <></> : <div className="mt-1 flex gap-1">
            {[...Array(props.stars)].map((_, index: number) => (<Star key={`star-${index}`} className="pt-1" filled />))}
        </div>}
    </section>
}

export default Guesses;
