import Menu from "@/app/menu";
import isLoggedIn from "@/core/util/auth-util";
import getUserInfo from "@/core/action/user/get-user-info";

export const dynamic = "force-dynamic";

export default async function AboutLayout({ children }: { children: React.ReactNode }) {
    const info = await isLoggedIn() ? await getUserInfo() : undefined;
    return <div className="min-h-dvh"><Menu info={info}/>{children}</div>;
}
