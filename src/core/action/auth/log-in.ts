"use server"

import { cookies } from "next/headers"
import { LogInFormState } from "@/core/model/form/form-definitions"
import { redirect } from "next/navigation";

export async function logIn(state: LogInFormState, formData: FormData) {

    const cookieStore = await cookies()

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

        let result: string | any
        if (response.status == 200) {
            result = await response.text()
            state!.token = result
            cookieStore.set('token', result, { httpOnly: true })

        } else {
            result = await response.json()
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
    redirect('/');
}