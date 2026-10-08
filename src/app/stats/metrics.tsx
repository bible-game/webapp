"use client";

import { useEffect, useState } from "react";
import { BookOpenIcon, FlameIcon, Gamepad2Icon, StarIcon } from "lucide-react";
import { CompletionUtil } from "@/core/util/completion-util";

interface Props {
    gameState?: any;
    readState?: any;
    reviewState?: any;
    bible: any;
    completionPercentage: string;
}

export default function Metrics(props: Readonly<Props>) {
    const [metrics, setMetrics] = useState({ stars: 0, games: 0, streak: 0 });
    useEffect(() => {
        setMetrics({ stars: CompletionUtil.calcStars(), games: CompletionUtil.calcGames(), streak: CompletionUtil.calcStreak() });
    }, []);

    const figures = [
        { label: "Stars", value: metrics.stars, icon: StarIcon, colour: "text-play-gold" },
        { label: "Games", value: metrics.games, icon: Gamepad2Icon, colour: "text-play-purple" },
        { label: "Day streak", value: metrics.streak, icon: FlameIcon, colour: "text-ui-orange" },
        { label: "Bible seen", value: `${props.completionPercentage}%`, icon: BookOpenIcon, colour: "text-play-teal" },
    ];

    return <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-ui-line py-6 sm:grid-cols-4">
        {figures.map(({ label, value, icon: Icon, colour }) => <div key={label}>
            <dt className="flex items-center gap-2 text-[13px] text-ui-muted"><Icon className={`size-4 ${colour}`}/>{label}</dt>
            <dd className="mt-2 text-[24px] font-semibold tabular-nums">{value}</dd>
        </div>)}
    </dl>;
}
