"use client"

import Background from "@/app/background"
import { Button } from "@heroui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Mail } from "lucide-react"
import { cardClassName } from "@/core/model/form/form-styles"

/**
 * Forgot Password (Coming Soon) Page
 * @since 17th February 2026
 */
export default function ForgotPassword() {
    return (
        <>
            <Background />
            <main className="flex items-center justify-center min-h-screen px-4 py-16 sm:py-24">
                <div className={`${cardClassName} max-w-md text-center space-y-5`}>
                    <Image
                        src="/icon-nobg.png"
                        alt="Bible Game"
                        width={56}
                        height={56}
                        className="mx-auto"
                    />

                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Mail className="text-indigo-400" size={28} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-semibold text-indigo-300">Reset Password</h1>
                    <p className="text-sm text-indigo-300">
                        This feature is coming soon. In the meantime, please reach out to us
                        for help resetting your password.
                    </p>
                    <p className="text-sm text-indigo-300">
                        hello@bible.game
                    </p>

                    <Button
                        as={Link}
                        href="/account/log-in"
                        variant="light"
                        className="text-indigo-400 hover:text-indigo-300"
                        startContent={<ArrowLeft size={16} />}
                    >
                        Back to Log In
                    </Button>
                </div>
            </main>
        </>
    )
}
