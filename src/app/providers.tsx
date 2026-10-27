"use client"

import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from "@heroui/toast";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { saveTimezone } from "@/core/util/timezone";

export default function Providers({ children }: any) {
    const [queryClient] = useState(() => new QueryClient());
    useEffect(saveTimezone, []);
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
