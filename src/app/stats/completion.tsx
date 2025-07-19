"use client"

import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import Heatmap from "@/app/stats/heatmap";
import { CompletionUtil } from "@/core/util/completion-util";

const Completion = (props: any) => {

    const [completion, setCompletion] = useState([] as any[]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCompletion(CompletionUtil.build(props.bible));
    }, []);

    useEffect(() => {
        if (completion) setLoading(false);
    }, [completion]);

    return loading ? <Spinner color="primary" className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)]"/> :
        <div className="pb-[8rem]">
            <Heatmap data={completion} />
        </div>

}

export default Completion;