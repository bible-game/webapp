"use client"

import React from "react";
import Guess from "@/app/play/[game]/guess";
import { Star } from "@/app/play/[game]/star";

const Guesses = (props: any) => {

    return <section className="px-4 flex justify-center flex-wrap gap-4 mt-0 sm:mt-4 absolute sm:bottom-[1.5rem] sm:py-0 py-2 sm:left-[calc(50%-23rem)]">
        {props.guesses.map((guess: any) => <Guess book={guess.bookKey || guess.book} key={guess.book + guess.chapter}
                                            chapter={guess.chapter}
                                            bookFound={props.bookFound}
                                            closeness={guess.closeness}/>)}
        {props.device != 'mobile' ? <></> : [...Array(props.stars)].map((_, index: number) => (<Star key={`star-${index}`} className="pt-1" filled />))}
    </section>
}

export default Guesses;