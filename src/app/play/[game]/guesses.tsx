"use client"

import React from "react";
import Guess from "@/app/play/[game]/guess";

const Guesses = (props: any) => {

    return <section className="px-4 flex justify-center flex-wrap gap-4 mt-4 absolute bottom-[-3.25rem]">
        {props.guesses.map((guess: any) => <Guess book={guess.bookKey} key={guess.book + guess.chapter}
                                            chapter={guess.chapter}
                                            closeness={guess.closeness}/>)}
    </section>
}

export default Guesses;