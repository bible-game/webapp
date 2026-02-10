"use client"

import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { StateUtil } from "@/core/util/state-util";
import { CompletionUtil } from "@/core/util/completion-util";
import Metrics from "@/app/stats/metrics";
import Heatmap from "@/app/stats/heatmap";

interface Props {
    bible: any;
    gameState?: any;
    readState?: any;
    reviewState?: any;
}

export default function StatsContent(props: Readonly<Props>) {
    const [completion, setCompletion] = useState<any>(null);
    const [completionPercentage, setCompletionPercentage] = useState('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (props.gameState) StateUtil.setAllGame(props.gameState);
        if (props.readState) StateUtil.setAllReads(props.readState);
        if (props.reviewState) StateUtil.setAllReviews(props.reviewState);

        const built = CompletionUtil.build(props.bible);
        const pct = CompletionUtil.calcPercentageFromBuilt(built);

        setCompletion(built);
        setCompletionPercentage(pct);
        setLoading(false);
    }, []);

    if (loading) {
        return <Spinner color="primary" className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)]" />;
    }

    return (
        <>
            <Metrics
                gameState={props.gameState}
                readState={props.readState}
                reviewState={props.reviewState}
                bible={props.bible}
                completionPercentage={completionPercentage}
            />
            <div className="pb-[8rem]">
                <Heatmap data={completion} bible={props.bible} />
            </div>
        </>
    );
}
