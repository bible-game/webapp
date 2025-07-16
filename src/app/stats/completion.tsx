"use client"

import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import Heatmap from "@/app/stats/heatmap";
import { GameStatesService } from "@/core/service/game-states-service";

const Completion = () => {

    const [completion, setCompletion] = useState([] as any[]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCompletion(GameStatesService.getCompletion);
    }, []);

    useEffect(() => {
        if (completion) setLoading(false);
    }, [completion]);

    return loading ? <Spinner color="primary" /> : <Heatmap data={completion} />

}

export default Completion;