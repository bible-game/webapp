"use server"

import { ResetPasswordFormState } from "@/core/model/form/form-definitions"
import { redirect } from "next/navigation";

export async function resetPassword(state: ResetPasswordFormState, formData: FormData) {

    if (!state) {
        state = {
            errors: {
                password: [],
                confirmPassword: [],
                form: []
            },
            success: false
        }
    } else {
        state.errors = {
            password: [],
            confirmPassword: [],
            form: []
        }
        state.success = false
    }

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const token = formData.get("token") as string

    if (password !== confirmPassword) {
        state.errors.confirmPassword.push("Passwords do not match.")
        return state
    }
    
    if (password.length < 8) {
        state.errors.password.push("Password must be at least 8 characters.")
        return state
    }

    if (!token) {
        state.errors.form.push("Invalid or missing reset token.")
        return state
    }

    try {
        const response = await fetch(`${process.env.SVC_USER}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token, password })
        })

        if (response.status === 200 || response.status === 204) {
            state.success = true
            // Redirecting inside the action after setting success might be abrupt, 
            // usually better to return success state and let client redirect or show message.
            // But let's follow the login pattern which redirects. 
            // However, for reset, showing a "Success, you can now login" message is better.
            // I'll leave success=true and let the UI handle the "Go to login" link.
        } else {
            const result = await response.json().catch(() => ({}))
            console.error(`Error resetting password:`, result)
            state.errors.form.push(result.message || "Failed to reset password. The link may have expired.")
        }
    } catch (error: any) {
        console.error(`Error resetting password: ${error.message}`)
        state.errors.form.push('An error occurred. Please try again later.')
    }

    return state
}
