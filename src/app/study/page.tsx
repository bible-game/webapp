'use server';

import Background from "@/app/background";
import Menu from "@/app/menu";
import getUserInfo, {UserInfo} from "@/core/action/user/get-user-info";
import isLoggedIn from "@/core/util/auth-util";
import StudyPicker from "@/app/study/study-picker";
import StudyHeader from "@/app/study/study-header";

export default async function Study() {
    let info: UserInfo | undefined;
    if (await isLoggedIn()) {
        info = await getUserInfo();
    }

    return (
        <>
            <Background />
            <main className="min-h-screen text-[#e8ecff] flex flex-col z-10 relative items-center w-full">
                <Menu isLanding={false} info={info} />
                <StudyHeader />
                <StudyPicker />
                <footer className="mt-auto py-6 border-t border-white/10 text-center text-sm text-[#adb3d6] w-full">
                    © {new Date().getFullYear()} Bible Game
                </footer>
            </main>
        </>
    );
}