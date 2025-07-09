"use client"

import React from 'react';
import Cell from "@/app/stats/cell";

const Heatmap = (props: any) => {

    return (
        <section className="flex flex-wrap sm:w-[46rem] w-[80vw] mb-12">
            {props.data.map((data: any) => data.chapters.map((chapter: any) => chapter.verses.map((verse: any, index: number) =>
                <Cell key={data.book + chapter.chapter + index} verse={verse}/>)))}
        </section>
    );
};

export default Heatmap;