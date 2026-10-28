"use client"

import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from "@heroui/toast";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { saveTimezone } from "@/core/util/timezone";
import { syncLocalState } from "@/core/util/state-sync";

export default function Providers({ children }: any) {
    const [queryClient] = useState(() => new QueryClient());
    const pathname = usePathname();
    useEffect(saveTimezone, []);
    // Log-in redirects without reloading, so look again on each page for a sync it has asked for
    useEffect(() => { syncLocalState(); }, [pathname]);
    return (
        <QueryClientProvider client={queryClient}>
            <MotionConfig reducedMotion="user">
            <HeroUIProvider>
                <ToastProvider />
                {children}
            </HeroUIProvider>
            </MotionConfig>
        </QueryClientProvider>
    )
}
