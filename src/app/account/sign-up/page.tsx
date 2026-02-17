'use client'

import React, { useActionState, useEffect, useState } from "react"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import Background from "@/app/background"
import Link from "next/link"
import Image from "next/image"
import { StateUtil } from "@/core/util/state-util"
import { Mail, Lock, User, Church, Eye, EyeOff } from "lucide-react"

import { signup } from "@/core/action/auth/sign-up"
import { SignUpFormState, SignUpFormSchema } from "@/core/model/form/form-definitions"
import { inputClassNames, alertClassNames, cardClassName, submitButtonClassName, submitButtonStyle } from "@/core/model/form/form-styles"
import { useFormValidation } from "@/core/hook/useFormValidation"

/**
 * Sign-Up Page
 * @since 6th June 2025
 */
export default function SignUp() {
    //@ts-ignore
    const [state, action, pending] = useActionState<SignUpFormState, FormData>(signup, undefined)
    const [isVisible, setIsVisible] = useState(false)
    const toggleVisibility = () => setIsVisible(!isVisible)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstname: "",
        lastname: "",
        church: "",
    })

    const { validateField, clearFieldError, getFieldProps, clearAllErrors } = useFormValidation(SignUpFormSchema)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        clearFieldError(name)

        // Re-validate confirmPassword when password changes and confirmPassword has a value
        if (name === "password" && formData.confirmPassword) {
            validateField("confirmPassword", formData.confirmPassword, { ...formData, password: value })
        }
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

    useEffect(() => {
        const games = Array.from(StateUtil.getAllGames().values())
        if (games) {
            const hidden = document.getElementById("games") as HTMLInputElement
            if (hidden) hidden.value = JSON.stringify(games)
        }

        const reviews = Array.from(StateUtil.getAllReviews().values())
        if (reviews) {
            const hidden = document.getElementById("reviews") as HTMLInputElement
            if (hidden) hidden.value = JSON.stringify(reviews)
        }

        const reads = Array.from(StateUtil.getAllReads().values())
        if (reads) {
            const hidden = document.getElementById("reads") as HTMLInputElement
            if (hidden) hidden.value = JSON.stringify(reads)
        }
    }, [])

    const fields = [
        { name: "email", type: "email", label: "Email", icon: Mail, isRequired: true },
        { name: "password", type: "password", label: "Password", icon: Lock, isPassword: true, isRequired: true, description: "At least 8 characters" },
        { name: "confirmPassword", type: "password", label: "Confirm Password", icon: Lock, isPassword: true, isRequired: true },
        { name: "firstname", type: "text", label: "First Name", icon: User, isRequired: true },
        { name: "lastname", type: "text", label: "Last Name", icon: User, isRequired: true },
        { name: "church", type: "text", label: "Home Church", icon: Church },
    ]

    const renderField = ({ name, type, label, icon: Icon, isPassword, isRequired, description }: {
        name: string; type: string; label: string;
        icon: React.ComponentType<{ className?: string; size?: number }>;
        isPassword?: boolean; isRequired?: boolean; description?: string;
    }) => (
        <Input
            key={name}
            classNames={inputClassNames}
            type={isPassword && isVisible ? "text" : type}
            label={label}
            variant="bordered"
            name={name}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            onBlur={handleBlur}
            isRequired={isRequired}
            description={description}
            {...getFieldProps(name)}
            startContent={
                <Icon className="text-indigo-300/50 pointer-events-none flex-shrink-0" size={20} />
            }
            endContent={
                isPassword ? (
                    <button
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label="toggle password visibility"
                    >
                        {isVisible ? (
                            <EyeOff className="text-indigo-300/50 pointer-events-none" size={20} />
                        ) : (
                            <Eye className="text-indigo-300/50 pointer-events-none" size={20} />
                        )}
                    </button>
                ) : undefined
            }
        />
    )

    return (
        <>
            <Background />
            <main className="flex items-center justify-center min-h-screen px-3 sm:px-4 py-12 sm:py-24">
                {!state?.success ? (
                    <div className={`${cardClassName} max-w-md text-center`}>
                        <Form
                            action={action}
                            validationErrors={state?.errors}
                            className="auth-form flex flex-col space-y-4"
                        >
                            <h1 className="text-2xl font-semibold text-indigo-300">Create Account</h1>

                            {fields.map(renderField)}

                            <input type="hidden" name="games" id="games" />
                            <input type="hidden" name="reviews" id="reviews" />
                            <input type="hidden" name="reads" id="reads" />

                            {/* Honeypot field for bot protection */}
                            <div style={{ display: 'none' }} aria-hidden="true">
                                <input
                                    type="text"
                                    name="website"
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

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

                            <Button
                                type="submit"
                                disabled={pending}
                                className={submitButtonClassName}
                                style={submitButtonStyle}
                            >
                                {pending ? (
                                    <span className="flex items-center gap-2">
                                        <CircularProgress
                                            aria-label="Creating account..."
                                            size="sm"
                                            color="secondary"
                                        />
                                        Creating...
                                    </span>
                                ) : (
                                    "Sign Up"
                                )}
                            </Button>

                            <p className="text-xs text-indigo-400">
                                Already have an account?{" "}
                                <Link
                                    href="/account/log-in"
                                    className="underline hover:text-indigo-300 font-medium"
                                >
                                    Log in
                                </Link>
                            </p>
                        </Form>
                    </div>
                ) : (
                    <div className={`${cardClassName} max-w-md text-center space-y-5`}>
                        {/* Animated Checkmark */}
                        <div className="flex justify-center">
                            <svg
                                className="w-20 h-20"
                                viewBox="0 0 80 80"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="36"
                                    stroke="rgb(129 140 248)"
                                    strokeWidth="3"
                                    fill="none"
                                    style={{
                                        strokeDasharray: 226,
                                        strokeDashoffset: 226,
                                        animation: "circleIn 0.5s ease-out forwards",
                                    }}
                                />
                                <path
                                    d="M24 42 L35 53 L56 28"
                                    stroke="rgb(129 140 248)"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                    style={{
                                        strokeDasharray: 50,
                                        strokeDashoffset: 50,
                                        animation: "checkIn 0.4s ease-out 0.4s forwards",
                                    }}
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-semibold text-indigo-300">Account Created!</h1>
                        <p className="text-sm text-indigo-300">
                            You can now log in with your new credentials.
                        </p>
                        <Button
                            as={Link}
                            href="/account/log-in"
                            className={`${submitButtonClassName} p-4`}
                            style={submitButtonStyle}
                        >
                            Log In
                        </Button>
                    </div>
                )}
            </main>
        </>
    )
}
