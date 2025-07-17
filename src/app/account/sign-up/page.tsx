'use client'

import { signup } from "@/core/action/sign-up";
import { SignUpFormSchema } from "@/core/model/form-definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import Background from "@/app/background";
import React from "react";

/**
 * Sign-Up Page
 * @since 6th June 2025
 */
export default function SignUp() {

    const [state, dispatch] = useFormState(signup, undefined)
    const { register, formState: { errors } } = useForm({
        resolver: zodResolver(SignUpFormSchema)
    })

    return (
        <>
            <Background/>
            <main className="flex items-center justify-center min-h-screen px-4">
                {!state?.success ? (
                    <form
                        action={dispatch}
                        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-2xl text-white space-y-5"
                    >
                        {/* Title */}
                        <div className="text-center mb-2">
                            <h1 className="text-2xl font-semibold">Create an Account</h1>
                            <p className="text-sm text-indigo-300 mt-1">
                                Start tracking your scripture progress
                            </p>
                        </div>

                        {/* Input Fields */}
                        {[
                            {name: "email", type: "email", placeholder: "Email"},
                            {name: "password", type: "password", placeholder: "Password"},
                            {name: "firstname", type: "text", placeholder: "First Name"},
                            {name: "lastname", type: "text", placeholder: "Last Name"},
                            {name: "church", type: "text", placeholder: "Home Church"},
                        ].map(({name, type, placeholder}) => (
                            <div key={name} className="space-y-1">
                                <input
                                    {...register(name as any)}
                                    type={type}
                                    placeholder={placeholder}
                                    className="w-full px-4 py-2 bg-white/10 rounded-lg text-sm placeholder-indigo-300 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                                {//@ts-ignore
                                    errors[name] && (
                                    <p className="text-sm text-red-400">
                                        {//@ts-ignore
                                            errors[name]?.message?.toString()}
                                    </p>
                                )}
                                {//@ts-ignore
                                    state?.errors?.[name]?.map((err: string) => (
                                    <p key={err} className="text-sm text-red-400">{err}</p>
                                ))}
                            </div>
                        ))}

                        {/* General Form Errors */}
                        {state?.errors?.form?.map((error: string) => (
                            <p key={error} className="text-sm text-red-400 text-center">{error}</p>
                        ))}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white py-2 rounded-lg font-medium transition-all"
                        >
                            Sign Up
                        </button>

                        {/* Or login */}
                        <p className="text-xs text-center text-indigo-400 mt-2">
                            Already have an account?{' '}
                            <a href="/account/log-in" className="underline hover:text-indigo-300">
                                Log in
                            </a>
                        </p>
                    </form>
                ) : (
                    <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-8 shadow-2xl text-white space-y-5 text-center">
                        <h1 className="text-2xl font-semibold">Account Created!</h1>
                        <p className="text-sm text-indigo-300 mt-1">
                            You can now log in with your new credentials.
                        </p>
                        <a
                            href="/account/log-in"
                            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white py-2 rounded-lg font-medium transition-all"
                        >
                            Log In
                        </a>
                    </div>
                )}
            </main>
        </>
    );
}