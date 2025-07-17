"use client"

import React, { useActionState } from "react"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import Background from "@/app/background"
import Link from "next/link"

import { login } from "@/core/action/login"
import { LogInFormState } from "@/core/model/form-definitions"

/**
 * Log-In Page
 * @since 6th June 2025
 */
export default function LogIn() {
    const [state, action, pending] = useActionState<LogInFormState, FormData>(login, undefined)
    
    const inputClassNames = {
        base: "text-white", // wrapper span
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
                    <Form
                        action={action}
                        validationErrors={state?.errors}
                        className="flex flex-col gap-5"
                    >
                        {/* Title */}
                        <div className="text-center mb-2">
                            <h1 className="text-2xl font-semibold">Log In</h1>
                            <p className="text-sm text-indigo-300 mt-1">
                                Welcome back! Continue your scripture journey.
                            </p>
                        </div>

                        {/* Email */}
                        <Input
                            classNames={inputClassNames}
                            label="Email"
                            variant="bordered"
                            type="email"
                            name="email"
                            isRequired
                        />

                        {/* Password */}
                        <Input
                            classNames={inputClassNames}
                            type="password"
                            label="Password"
                            variant="bordered"
                            name="password"
                            isRequired
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
                      aria-label="Checking credentials..."
                      size="sm"
                      color="secondary"
                  />
                  Checking...
                </span>
                            ) : (
                                "Log In"
                            )}
                        </Button>

                        {/* Footer */}
                        <p className="text-xs text-center text-indigo-400 mt-2">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/account/sign-up"
                                className="underline hover:text-indigo-300 font-medium"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </Form>
                </div>
            </main>
        </>
    )
}
