import getUserInfo from "@/core/action/user/get-user-info";
import Menu from "@/app/menu";
import Background from "@/app/background";
import React from "react";
import ProfileMain from "@/app/profile/main";
import ProfileSidebar from "@/app/profile/sidebar";

/**
 * Profile Page
 * @author AdamJ335
 * @since 11th Oct 2025
 */
export default async function Profile() {

    // Get User data to go from there
    const info = await getUserInfo();


    return (
        <>
            <Background/>
            <main className="w-full relative z-1">
                <Menu isStats={true} info={info}/>

                <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
                    <ProfileSidebar info={info} />
                    <ProfileMain info={info} />
                </div>
            </main>

        </>
    )
}