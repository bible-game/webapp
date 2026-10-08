"use client"

import React, { useActionState, Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import { inputClassNames, alertClassNames, submitButtonClassName } from "@/core/model/form/form-styles";
import Link from "next/link"

import { resetPassword } from "@/core/action/auth/reset-password"
import { ResetPasswordFormState } from "@/core/model/form/form-definitions"
import { validateToken } from "@/core/action/auth/validate-token";

/**
 * Reset Password Content
 */
function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token") || ""
    const [tokenValid, setTokenValid] = useState(false)

    useEffect(() => {
        validateToken(token)
            .then((result: boolean) => setTokenValid(result))
    }, [token])

    //@ts-ignore
    const [state, action, pending] = useActionState<ResetPasswordFormState, FormData>(resetPassword, undefined)


    if (!token || !tokenValid) {
        return (
            <div className="w-full max-w-md text-ui-text text-center">
                <h1 className="text-2xl font-semibold">Invalid Link</h1>
                <p className="text-sm text-ui-muted mt-2 mb-6">
                    The password reset link is invalid or has expired.
                </p>
                <Button
                    as={Link}
                    href="/account/forgot-password"
                    className={submitButtonClassName}
                >
                    Request a new link
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md text-ui-text">
            <Form
                action={action}
                validationErrors={state?.errors}
                className="auth-form flex flex-col gap-5"
            >
                <div className="text-center mb-2">
                    <h1 className="text-2xl font-semibold">Reset Password</h1>
                    <p className="text-sm text-ui-muted mt-1">
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
                    className={submitButtonClassName}
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
            <main className="auth-page">
                <Suspense fallback={<CircularProgress aria-label="Loading..." />}>
                    <ResetPasswordContent />
                </Suspense>
            </main>
        </>
    )
}
