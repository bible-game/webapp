"use client"

import React from 'react';
import Cell from "@/app/stats/cell";

const Heatmap = (props: any) => {

    return (
        <section className="flex flex-wrap sm:w-[46rem] w-[80vw] pb-12">
            {props.data.map((data: any) => <div className="p-0 flex flex-wrap" key={data.book}>
                <p className="font-extralight text-[10px] w-full pb-1 pt-2 opacity-80">{data.book}</p>
                {data.chapters.map((chapter: any) => <div key={data.book+chapter.chapter} className="p-[1px] flex flex-wrap">{chapter.verses.map((verse: any, index: number) =>
                    <Cell key={data.book + chapter.chapter + index} verse={verse}/>)}</div>)}</div>)}
        </section>
    );
};

export default Heatmap;