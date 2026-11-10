import { redirect } from "next/navigation";
import { accountNext } from "@/core/auth/paths";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams;
    redirect("/account/log-in?next=" + encodeURIComponent(accountNext(next)));
}
