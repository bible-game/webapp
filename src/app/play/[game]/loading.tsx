"use client"

import { Spinner } from "@heroui/react";

/** Shown straight away while the server fetches the page's data */
export default function Loading() {
    return <Spinner color="primary" aria-label="Loading" className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)]" />;
}
