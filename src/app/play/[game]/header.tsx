"use client";

import moment from "moment";
import { redirect } from "next/navigation";
import AppHeader from "@/core/component/app-header";
import DatePicker from "./date-picker";

function formatDate(date: string): string {
    const day = moment(date);
    if (date === "today" || day.isSame(moment(), "day")) return "Today";
    return day.format(day.isSame(moment(), "year") ? "ddd D MMM" : "ddd D MMM YYYY");
}

export default function Header(props: any) {
    return <AppHeader info={props.info}>
        <DatePicker date={props.date} label={formatDate(props.date)} onChange={date => redirect(`/play/${date}`)}/>
    </AppHeader>;
}
