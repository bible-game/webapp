"use server"

import { ForgotPasswordFormState } from "@/core/model/form/form-definitions"

export async function forgotPassword(state: ForgotPasswordFormState, formData: FormData) {

    if (!state) {
        state = {
            errors: {
                email: [],
                form: []
            },
            success: false,
            message: ""
        }
    } else {
        state.errors = {
            email: [],
            form: []
        }
        state.success = false
        state.message = ""
    }

    const email = formData.get("email")

    if (!email || typeof email !== "string") {
        state.errors.email.push("Please enter a valid email address.")
        return state
    }

    try {
        const response = await fetch(`${process.env.SVC_USER}/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })

        if (response.status === 200 || response.status === 204) {
             // We generally return success even if email doesn't exist for security,
             // or the API might return specific info.
             // Assuming 200/204 means "If that email exists, we sent a link."
            state.success = true
            state.message = "If an account exists with this email, you will receive a password reset link shortly."
        } else {
            const result = await response.json().catch(() => ({}))
             // Handle specific errors if needed, but generic is safer for auth
            console.error(`Error requesting password reset for [Email: ${email}]:`, result)
            state.errors.form.push("Unable to process request. Please try again later.")
        }
    } catch (error: any) {
        console.error(`Error requesting password reset for [Email: ${email}]: ${error.message}`)
        state.errors.form.push('An error occurred. Please try again later.')
    }

    return state
}
