"use client";

import AppHeader, { type AppHeaderProps } from "@/core/component/app-header";
import GroundWindow from "@/core/component/ground-window";

/** The page header: sticky and solid, a window onto the ground, as on Read (so content scrolls away beneath it) */
export default function Menu(props: AppHeaderProps) {
    return <div className="page-header">
        <GroundWindow/>
        <div className="app-header"><AppHeader info={props.info}/></div>
    </div>;
}
