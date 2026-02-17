"use client"

import React, { useActionState, useEffect, useState } from "react"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import Background from "@/app/background";
import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

import { logIn } from "@/core/action/auth/log-in"
import { LogInFormState, LogInFormSchema } from "@/core/model/form/form-definitions"
import { inputClassNames, alertClassNames, cardClassName, submitButtonClassName, submitButtonStyle } from "@/core/model/form/form-styles"
import { useFormValidation } from "@/core/hook/useFormValidation"

/**
 * Log-In Page
 * @since 6th June 2025
 */
export default function LogIn() {
    //@ts-ignore
    const [state, action, pending] = useActionState<LogInFormState, FormData>(logIn, undefined)
    const [isVisible, setIsVisible] = useState(false)
    const toggleVisibility = () => setIsVisible(!isVisible)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const { validateField, clearFieldError, getFieldProps, clearAllErrors } = useFormValidation(LogInFormSchema)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        clearFieldError(name)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (value) {
            validateField(name, value, formData)
        }
    }

    // Clear client errors when server state changes
    useEffect(() => {
        if (state) {
            clearAllErrors()
        }
    }, [state, clearAllErrors])

    return (
        <>
            <Background />
            <main className="flex items-center justify-center min-h-screen px-3 sm:px-4 py-12 sm:py-24">
                <div className={`${cardClassName} max-w-sm text-center`}>
                    <Form
                        action={action}
                        validationErrors={state?.errors}
                        className="auth-form flex flex-col space-y-4"
                    >
                        <h1 className="text-2xl font-semibold text-indigo-300">Log In</h1>

                        {/* Email */}
                        <Input
                            classNames={inputClassNames}
                            label="Email"
                            variant="bordered"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isRequired
                            {...getFieldProps("email")}
                            startContent={
                                <Mail className="text-indigo-300/50 pointer-events-none flex-shrink-0" size={20} />
                            }
                        />

                        {/* Password */}
                        <Input
                            classNames={inputClassNames}
                            type={isVisible ? "text" : "password"}
                            label="Password"
                            variant="bordered"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isRequired
                            {...getFieldProps("password")}
                            startContent={
                                <Lock className="text-indigo-300/50 pointer-events-none flex-shrink-0" size={20} />
                            }
                            endContent={
                                <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                                    {isVisible ? (
                                        <EyeOff className="text-indigo-300/50 pointer-events-none" size={20} />
                                    ) : (
                                        <Eye className="text-indigo-300/50 pointer-events-none" size={20} />
                                    )}
                                </button>
                            }
                        />
                        <Link
                            href="/account/forgot-password"
                            className="text-xs text-indigo-400 hover:text-indigo-300 self-end -mt-2 transition-colors"
                        >
                            Forgot password?
                        </Link>

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
                            className={submitButtonClassName}
                            style={submitButtonStyle}
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

                        <p className="text-xs text-indigo-400">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/account/sign-up"
                                className="underline hover:text-indigo-300 font-medium">
                                Sign Up
                            </Link>
                        </p>
                    </Form>
                </div>
            </main>
        </>
    )
}
