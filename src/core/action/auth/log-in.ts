"use server"

import { LogInFormState } from "@/core/model/form/form-definitions"
import { redirect } from "next/navigation";
import { setCookie } from "@/core/action/auth/cookie";

export async function logIn(state: LogInFormState, formData: FormData) {

    if (!state) {
        state = {
            errors: {
                email: [],
                password: [],
                form: []
            },
            token: undefined
        }
    } else {
        state.errors = {
            email: [],
            password: [],
            form: []
        }
        state.token = undefined
    }

    const body = {
        email: formData.get("email"),
        password: formData.get("password")
    }

    try {
        const response = await fetch(`${process.env.SVC_USER}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        if (response.status == 200) {
            const tokens = await response.json() as { authToken: string, refreshToken: string }
            state!.token = tokens.authToken
            await setCookie('token', tokens.authToken)
            await setCookie('refresh', tokens.refreshToken)

        } else {
            const result = await response.json()
            console.error(`Error when logging in with [Email: ${body.email}, Password: ${body.password}]: ${result.error}`)
            switch (response.status) {
                case 401:
                    state.errors.form.push('The provided username and password don\'t match!')
                    break
                default:
                    state.errors.form.push(`An error occurred on our end. Please try again later or reach out for support if this persists.`)
            }
        }
    } catch (error: any) {
        console.error(`Error when logging in with [Email: ${body.email}, Password: ${body.password}]: ${error.message}`)
        state!.errors.form.push('An error occurred on our end. Please try again later or reach out for support if this persists.')
    }
    // return state

    redirect('/stats');
}