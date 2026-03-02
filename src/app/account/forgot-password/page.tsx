"use client"

import React, { useActionState } from "react"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import Background from "@/app/background";
import Link from "next/link"

import { forgotPassword } from "@/core/action/auth/forgot-password"
import { ForgotPasswordFormState } from "@/core/model/form/form-definitions"

/**
 * Forgot Password Page
 */
export default function ForgotPassword() {
    //@ts-ignore
    const [state, action, pending] = useActionState<ForgotPasswordFormState, FormData>(forgotPassword, undefined)

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

    return (
        <>
            <Background />
            <main className="flex items-center justify-center min-h-screen px-4 pt-24 sm:pt-32">
                <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-2xl text-white">
                    {state?.success ? (
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-white">Check your email</h1>
                                <p className="text-sm text-indigo-300 mt-2">
                                    We&apos;ve sent a password reset link to your email address.
                                </p>
                            </div>
                            <Button
                                as={Link}
                                href="/account/log-in"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-all"
                            >
                                Back to Log In
                            </Button>
                        </div>
                    ) : (
                        <Form
                            action={action}
                            validationErrors={state?.errors}
                            className="flex flex-col gap-5"
                        >
                            <div className="text-center mb-2">
                                <h1 className="text-2xl font-semibold">Forgot Password</h1>
                                <p className="text-sm text-indigo-300 mt-1">
                                    Enter your email and we&apos;ll send you a link to reset your password.
                                </p>
                            </div>

                            <Input
                                classNames={inputClassNames}
                                label="Email"
                                variant="bordered"
                                type="email"
                                name="email"
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
                                            aria-label="Sending request..."
                                            size="sm"
                                            color="secondary"
                                        />
                                        Sending...
                                    </span>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>

                            <p className="text-xs text-center text-indigo-400 mt-2">
                                Remembered your password?{" "}
                                <Link
                                    href="/account/log-in"
                                    className="underline hover:text-indigo-300 font-medium">
                                    Log In
                                </Link>
                            </p>
                        </Form>
                    )}
                </div>
            </main>
        </>
    )
}
