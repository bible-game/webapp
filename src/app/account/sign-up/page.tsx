'use client'

import React, { useActionState, useEffect, useState } from "react"
import { Form } from "@heroui/form"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { CircularProgress } from "@heroui/progress"
import { Alert } from "@heroui/alert"
import Background from "@/app/background"
import Link from "next/link"
import { StateUtil } from "@/core/util/state-util"
import { Mail, Lock, User, Church, Eye, EyeOff } from "lucide-react"

import { signup } from "@/core/action/auth/sign-up"
import { SignUpFormState } from "@/core/model/form/form-definitions"

/**
 * Sign-Up Page
 * @since 6th June 2025
 */
export default function SignUp() {
    //@ts-ignore
    const [state, action, pending] = useActionState<SignUpFormState, FormData>(signup, undefined)
    const [isVisible, setIsVisible] = useState(false)
    const toggleVisibility = () => setIsVisible(!isVisible)

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

    const inputClassNames = {
        base: "text-white", // wrapper span
        label: "text-indigo-300 group-data-[focus=true]:text-indigo-300",
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

    const fields = [
        { name: "email", type: "email", label: "Email", icon: Mail },
        { name: "password", type: "password", label: "Password", icon: Lock, isPassword: true },
        { name: "confirmPassword", type: "password", label: "Confirm Password", icon: Lock, isPassword: true },
        { name: "firstname", type: "text", label: "First Name", icon: User },
        { name: "lastname", type: "text", label: "Last Name", icon: User },
        { name: "church", type: "text", label: "Home Church", icon: Church },
    ]

    return (
        <>
            <Background />
            <main className="flex items-center justify-center min-h-screen px-4 pt-24 sm:pt-32">
                {!state?.success ? (
                    <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-2xl text-white">
                        <Form
                            action={action}
                            validationErrors={state?.errors}
                            className="flex flex-col gap-4"
                        >
                            {/* Title */}
                            <div className="text-center mb-2">
                                <h1 className="text-2xl font-semibold">Create an Account</h1>
                                <p className="text-sm text-indigo-300 mt-1">
                                    Start tracking your scripture progress
                                </p>
                            </div>

                            {/* Input Fields */}
                            {fields.map(({ name, type, label, icon: Icon, isPassword }) => (
                                <Input
                                    key={name}
                                    classNames={inputClassNames}
                                    type={isPassword && isVisible ? "text" : type}
                                    label={label}
                                    variant="bordered"
                                    name={name}
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
                            ))}

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

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={pending}
                                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-medium py-2 rounded-lg transition-all mt-2"
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

                            {/* Or login */}
                            <p className="text-xs text-center text-indigo-400 mt-2">
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
                    <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-2xl text-white space-y-5 text-center">
                        <h1 className="text-2xl font-semibold">Account Created!</h1>
                        <p className="text-sm text-indigo-300 mt-1">
                            You can now log in with your new credentials.
                        </p>
                        <Button
                            as={Link}
                            href="/account/log-in"
                            className="mt-4 p-4 w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white py-2 rounded-lg font-medium transition-all"
                        >
                            Log In
                        </Button>
                    </div>
                )}
            </main>
        </>
    )
}