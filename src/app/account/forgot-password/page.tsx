"use client"

import React, { useActionState } from "react"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import Background from "@/app/background";
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

import { forgotPassword } from "@/core/action/auth/forgot-password"
import { ForgotPasswordFormState } from "@/core/model/form/form-definitions"

/**
 * Forgot Password Page
 * @since 17th January 2026
 */
export default function ForgotPassword() {
    //@ts-ignore
    const [state, action, pending] = useActionState<ForgotPasswordFormState, FormData>(forgotPassword, undefined)

    const inputClassNames = {
        base: "text-white", 
        label: "!text-indigo-300",
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
    
    const successAlertClassNames = {
        base: "border-green-400/40 bg-green-500/10 text-green-300 rounded-lg px-3 py-2",
        content: "text-sm",
    }

    return (
        <>
            <Background />
            <main className="flex items-center justify-center min-h-screen px-4 pt-24 sm:pt-32">
                <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-2xl text-white">
                    <Form
                        action={action}
                        validationErrors={state?.errors}
                        className="flex flex-col gap-5"
                    >
                        {/* Title */}
                        <div className="text-center mb-2">
                            <h1 className="text-2xl font-semibold">Forgot Password</h1>
                            <p className="text-sm text-indigo-300 mt-1">
                                Enter your email to receive a reset link.
                            </p>
                        </div>

                        {!state?.success ? (
                            <>
                                {/* Email */}
                                <Input
                                    classNames={inputClassNames}
                                    label="Email"
                                    variant="bordered"
                                    type="email"
                                    name="email"
                                    isRequired
                                    startContent={
                                        <Mail className="text-indigo-300/50 pointer-events-none flex-shrink-0" size={20} />
                                    }
                                />

                                {/* Form-level server error */}
                                {state?.errors?.form && state.errors.form.length > 0 && (
                                    <Alert
                                        hideIcon
                                        variant="bordered"
                                        color="danger"
                                        description={state.errors.form[0]}
                                        classNames={alertClassNames}
                                    />
                                )}

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    disabled={pending}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-medium py-2 rounded-lg transition-all"
                                >
                                    {pending ? (
                                        <span className="flex items-center gap-2">
                                          <CircularProgress
                                              aria-label="Sending..."
                                              size="sm"
                                              color="secondary"
                                          />
                                          Sending...
                                        </span>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </>
                        ) : (
                            <div className="text-center space-y-4">
                                <Alert
                                    hideIcon
                                    variant="bordered"
                                    color="success"
                                    title="Check your email"
                                    description={state.message}
                                    classNames={successAlertClassNames}
                                />
                                <Button
                                    as={Link}
                                    href="/account/log-in"
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition-all"
                                >
                                    Return to Log In
                                </Button>
                            </div>
                        )}

                        {/* Back to Login */}
                        {!state?.success && (
                            <div className="text-center mt-2">
                                <Link
                                    href="/account/log-in"
                                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Back to Log In
                                </Link>
                            </div>
                        )}
                    </Form>
                </div>
            </main>
        </>
    )
}
