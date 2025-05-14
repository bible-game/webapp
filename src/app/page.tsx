"use client"

import { redirect } from "next/navigation";
import moment from "moment";

export default async function Page() {
    const today = moment(new Date()).format('YYYY-MM-DD');
    redirect(`/play/${today}`);
}