"use client"

import React, { useActionState } from "react"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import { inputClassNames, alertClassNames, submitButtonClassName } from "@/core/model/form/form-styles";
import Link from "next/link"

import { forgotPassword } from "@/core/action/auth/forgot-password"
import { ForgotPasswordFormState } from "@/core/model/form/form-definitions"

/**
 * Forgot Password Page
 */
export default function ForgotPassword() {
    //@ts-ignore
    const [state, action, pending] = useActionState<ForgotPasswordFormState, FormData>(forgotPassword, undefined)


    return (
        <>
            <main className="auth-page">
                <div className="w-full max-w-md text-ui-text">
                    {state?.success ? (
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-white">Check your email</h1>
                                <p className="text-sm text-ui-muted mt-2">
                                    We&apos;ve sent a password reset link to your email address.
                                </p>
                            </div>
                            <Button
                                as={Link}
                                href="/account/log-in"
                                className={submitButtonClassName}
                            >
                                Back to Log In
                            </Button>
                        </div>
                    ) : (
                        <Form
                            action={action}
                            validationErrors={state?.errors}
                            className="auth-form flex flex-col gap-5"
                        >
                            <div className="text-center mb-2">
                                <h1 className="text-2xl font-semibold">Forgot Password</h1>
                                <p className="text-sm text-ui-muted mt-1">
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
                                className={submitButtonClassName}
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

                            <p className="text-xs text-center text-ui-muted mt-2">
                                Remembered your password?{" "}
                                <Link
                                    href="/account/log-in"
                                    className="underline hover:text-ui-muted font-medium">
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
