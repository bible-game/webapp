import { Toaster } from "react-hot-toast";
import React from "react";
import Navigation from "@/core/component/navigation";

/**
 * Game Play Page
 * @since 12th April 2025
 */
export default function Play() {
    return (
        <main>
            <Toaster position="bottom-right"/>
            <p>Play</p>
            <Navigation stats={true} read={true}/>
        </main>
    );
}