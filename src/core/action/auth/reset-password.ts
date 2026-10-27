"use server"

import { ResetPasswordFormSchema, ResetPasswordFormState } from "@/core/model/form/form-definitions"
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function resetPassword(state: ResetPasswordFormState, formData: FormData) {
    if (!state) {
        state = {
            errors: {
                password: [],
                confirmPassword: [],
                form: []
            }
        }
    } else {
        state.errors = {
            password: [],
            confirmPassword: [],
            form: []
        }
        state.success = false
    }

    const token = formData.get("token") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    const validated = ResetPasswordFormSchema.safeParse({ password, confirmPassword })
    if (!validated.success) {
        const fieldErrors = validated.error.flatten().fieldErrors
        state.errors.password = fieldErrors.password ?? []
        state.errors.confirmPassword = fieldErrors.confirmPassword ?? []
        return state
    }

    const body = {
        resetToken: token,
        password: validated.data.password
    }

    try {
        const response = await fetch(`${process.env.SVC_USER}/auth/update-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        if (response.ok) {
            state.success = true
            // The reset has ended every existing session, including any in this browser
            const cookieStore = await cookies()
            cookieStore.delete('token')
        } else {
            const result = await response.json()
            console.error(`Error when resetting password: ${result.message}`)
            state.errors.form.push(result.message || 'An error occurred. Please try again.')
            return state
        }
    } catch (error: any) {
        console.error(`Error when resetting password: ${error.message}`)
        state.errors.form.push('An error occurred on our end. Please try again later.')
        return state
    }

    redirect('/account/log-in?reset=success')
}
