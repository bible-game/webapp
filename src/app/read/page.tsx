import { Toaster } from "react-hot-toast";
import React from "react";
import Navigation from "@/core/component/navigation";

/**
 * Read Passage Page
 * @since 12th April 2025
 */
export default function Read() {
    return (
        <main>
            <Toaster position="bottom-right"/>
            <p>Read</p>
            <Navigation stats={true} play={true}/>
        </main>
    );
}