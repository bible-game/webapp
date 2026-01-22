"use client"

import React, { useActionState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import Background from "@/app/background";
import Link from "next/link"

import { resetPassword } from "@/core/action/auth/reset-password"
import { ResetPasswordFormState } from "@/core/model/form/form-definitions"

/**
 * Reset Password Content
 */
function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token") || ""

    //@ts-ignore
    const [state, action, pending] = useActionState<ResetPasswordFormState, FormData>(resetPassword, undefined)

    const inputClassNames = {
        base: "text-white",
        label: "text-indigo-300",
        input: "text-white placeholder:text-indigo-300",
        inputWrapper:
            "bg-white/10 data-[hover=true]:bg-white/15 " +
            "group-data-[focus=true]:bg-white/20 border border-white/20 " +
            "group-data-[focus=true]:border-indigo-500 " +
            "rounded-lg transition-colors",
        helperWrapper: "pt-1",
        errorMessage: "text-red-400 text-xs",
    }

    const alertClassNames = {
        base: "border-red-400/40 bg-red-500/10 text-red-300 rounded-lg px-3 py-2",
        content: "text-sm",
    }

    if (!token) {
        return (
            <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-2xl text-white text-center">
                <h1 className="text-2xl font-semibold">Invalid Link</h1>
                <p className="text-sm text-indigo-300 mt-2 mb-6">
                    The password reset link is invalid or has expired.
                </p>
                <Button
                    as={Link}
                    href="/account/forgot-password"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-all"
                >
                    Request a new link
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-2xl text-white">
            <Form
                action={action}
                validationErrors={state?.errors}
                className="flex flex-col gap-5"
            >
                <div className="text-center mb-2">
                    <h1 className="text-2xl font-semibold">Reset Password</h1>
                    <p className="text-sm text-indigo-300 mt-1">
                        Enter your new password below.
                    </p>
                </div>

                <input type="hidden" name="token" value={token} />

                <Input
                    classNames={inputClassNames}
                    type="password"
                    label="New Password"
                    variant="bordered"
                    name="password"
                    isRequired
                />

                <Input
                    classNames={inputClassNames}
                    type="password"
                    label="Confirm New Password"
                    variant="bordered"
                    name="confirmPassword"
                    isRequired
                />

                {state?.errors?.form && state.errors.form.length > 0 && (
                    <Alert
                        hideIcon
                        variant="bordered"
                        color="danger"
                        description={state.errors.form[0]}
                        classNames={alertClassNames}
                    />
                )}

                <Button
                    type="submit"
                    disabled={pending}
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-medium py-2 rounded-lg transition-all"
                >
                    {pending ? (
                        <span className="flex items-center gap-2">
                            <CircularProgress
                                aria-label="Resetting password..."
                                size="sm"
                                color="secondary"
                            />
                            Resetting...
                        </span>
                    ) : (
                        "Reset Password"
                    )}
                </Button>
            </Form>
        </div>
    )
}

/**
 * Reset Password Page
 */
export default function ResetPassword() {
    return (
        <>
            <Background />
            <main className="flex items-center justify-center min-h-screen px-4 pt-24 sm:pt-32">
                <Suspense fallback={<CircularProgress aria-label="Loading..." />}>
                    <ResetPasswordContent />
                </Suspense>
            </main>
        </>
    )
}
