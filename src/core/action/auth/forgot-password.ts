"use server"

import { ForgotPasswordFormSchema, ForgotPasswordFormState } from "@/core/model/form/form-definitions"

export async function forgotPassword(state: ForgotPasswordFormState, formData: FormData) {
    if (!state) {
        state = {
            errors: {
                email: [],
                form: []
            }
        }
    } else {
        state.errors = {
            email: [],
            form: []
        }
        state.success = false
    }

    const validated = ForgotPasswordFormSchema.safeParse({ email: formData.get("email") })
    if (!validated.success) {
        state.errors.email = ["Please enter a valid email address"]
        return state
    }
    const email = validated.data.email

    try {
        const response = await fetch(`${process.env.SVC_USER}/auth/request-password-reset?email=${encodeURIComponent(email)}`, {
            method: "POST",
            cache: "no-store",
        })

        if (response.ok) {
            state.success = true
        } else {
            state.errors.form.push('An error occurred. Please try again.')
        }
    } catch (error: any) {
        console.error("Password reset request failed")
        state.errors.form.push('An error occurred on our end. Please try again later.')
    }

    return state
}
