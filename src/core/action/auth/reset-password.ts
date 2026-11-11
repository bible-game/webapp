"use server"

import { ResetPasswordFormSchema, ResetPasswordFormState } from "@/core/model/form/form-definitions"
import { z } from "zod"
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
        const fieldErrors = z.flattenError(validated.error).fieldErrors
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
            cache: "no-store",
            body: JSON.stringify(body)
        })

        if (response.ok) {
            state.success = true
            // The reset has ended every existing session, including any in this browser
            const cookieStore = await cookies()
            cookieStore.delete('token')
        } else {
            state.errors.form.push(response.status === 400 ? 'This reset link is invalid or has expired. Please request a new one.' : 'An error occurred. Please try again later.')
            return state
        }
    } catch (error: any) {
        console.error(`Error when resetting password: ${error.message}`)
        state.errors.form.push('An error occurred on our end. Please try again later.')
        return state
    }

    redirect('/account/log-in?reset=success')
}
