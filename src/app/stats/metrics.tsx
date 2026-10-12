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

/** Whole percentages, as on Home; any progress below 1% reads "<1" rather than a discouraging 0 */
const wholePercent = (percent: string) => {
    const value = parseFloat(percent) || 0;
    return value === 0 ? "0" : value < 1 ? "<1" : String(Math.round(value));
};

export default function Metrics(props: Readonly<Props>) {
    const [metrics, setMetrics] = useState({ stars: 0, games: 0, streak: 0 });
    useEffect(() => {
        setMetrics({ stars: CompletionUtil.calcStars(), games: CompletionUtil.calcGames(), streak: CompletionUtil.calcStreak() });
    }, []);

    const figures = [
        { label: "Stars", value: metrics.stars, icon: StarIcon, colour: "text-ui-accent" },
        { label: "Games", value: metrics.games, icon: Gamepad2Icon, colour: "text-ui-text" },
        { label: "Day streak", value: metrics.streak, icon: FlameIcon, colour: "text-ui-orange" },
        { label: "Bible seen", value: `${wholePercent(props.completionPercentage)}%`, icon: BookOpenIcon, colour: "text-ui-text" },
    ];

    return <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-ui-line py-6 sm:grid-cols-4">
        {figures.map(({ label, value, icon: Icon, colour }) => <div key={label}>
            <dt className="flex items-center gap-2 text-[13px] text-ui-muted"><Icon className={`size-4 ${colour}`}/>{label}</dt>
            <dd className="mt-2 text-[24px] font-semibold tabular-nums">{value}</dd>
        </div>)}
    </dl>;
}
