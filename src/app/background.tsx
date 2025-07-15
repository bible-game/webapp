"use client"

import React from "react";

const Background = () => {
    return <section>
        <div aria-hidden="true"
             className="fixed hidden dark:md:block dark:opacity-100 -bottom-[20%] -left-[10%] z-0">
            <img
                src="/bg-left.png"
                className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-85 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                alt="docs left background" data-loaded="true"/>
        </div>
        <div aria-hidden="true"
             className="fixed hidden dark:md:block dark:opacity-75 -top-[40%] -right-[60%] 2xl:-top-[60%] 2xl:-right-[45%] z-0 rotate-12">
            <img src="/bg-right.png"
                 className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-65 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                 alt="docs right background" data-loaded="true"/>
        </div>
    </section>
}

export default Background;