import { Toaster } from "react-hot-toast";
import React from "react";
import Navigation from "@/core/component/navigation";

/**
 * Statistics Page
 * @since 12th April 2025
 */
export default function Stats() {
    return (
        <main>
            <Toaster position="bottom-right"/>
            <p>Statistics</p>
            <Navigation read={true} play={true}/>
        </main>
    );
}