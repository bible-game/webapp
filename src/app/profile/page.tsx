import getUserInfo from "@/core/action/user/get-user-info";
import Menu from "@/app/menu";
import Background from "@/app/background";
import React from "react";

/**
 * Profile Page
 * @author AdamJ335
 * @since 11th Oct 2025
 */
export default async function Profile() {

    // Get User data to go from there
    const info = await getUserInfo();
    const displayName = `${info?.firstname} ${info?.lastname}`;


    return (
        <>
            <Background/>
            <main className="w-full relative z-1">
                <Menu isStats={true} info={info}/>
                <h1>Hello {displayName}</h1>
            </main>

        </>
    )
}