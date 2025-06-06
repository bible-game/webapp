"use client" // question :: req?

import React, { useEffect } from "react";
import { redirect } from "next/navigation";
import { LocalStorageService } from "@/core/service/state/local-storage-service";

/**
 * Player Account Page
 * @since 6th June 2025
 */
export default async function Account() {

    useEffect(() => {
        if (typeof window !== "undefined") {
            loadState();
        }
    }, []);

    function loadState() {
        const token = LocalStorageService.retrieve('token')
        if (!token) {
            redirect('/account/sign-up')
        }
    }

    return (
        <>
            <main>
                <p>Accounts</p>
            </main>
        </>
    );

}