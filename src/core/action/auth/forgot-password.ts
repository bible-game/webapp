"use server"

import { ForgotPasswordFormState } from "@/core/model/form/form-definitions"

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

    const email = formData.get("email") as string

    try {
        const response = await fetch(`${process.env.SVC_USER}/auth/request-password-reset?email=${encodeURIComponent(email)}`, {
            method: "POST",
        })

        if (response.ok) {
            state.success = true
        } else {
            const result = await response.text()
            console.error(`Error when requesting password reset for [Email: ${email}]: ${result}`)
            state.errors.form.push(result || 'An error occurred. Please try again.')
        }
    } catch (error: any) {
        console.error(`Error when requesting password reset for [Email: ${email}]: ${error.message}`)
        state.errors.form.push('An error occurred on our end. Please try again later.')
    }

    return state
}
