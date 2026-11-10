"use client"

import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from "@heroui/toast";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { saveTimezone } from "@/core/util/timezone";
import AuthStateBoundary from "@/core/component/account/auth-state-boundary";

export default function Providers({ children, serverUserId = null }: { children: React.ReactNode; serverUserId?: string | null }) {
    const [queryClient] = useState(() => new QueryClient());
    useEffect(saveTimezone, []);
    return (
        <QueryClientProvider client={queryClient}>
            <MotionConfig reducedMotion="user">
            <HeroUIProvider>
                <ToastProvider />
                <AuthStateBoundary serverUserId={serverUserId}>{children}</AuthStateBoundary>
            </HeroUIProvider>
            </MotionConfig>
        </QueryClientProvider>
    )
}
