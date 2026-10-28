"use server"

import { LogInFormState, LogInFormSchema } from "@/core/model/form/form-definitions"
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { safeNext, setAuthCookies } from "@/core/util/auth-cookies";
import { SYNC_PENDING_COOKIE, SYNC_PENDING_MAX_AGE } from "@/core/util/sync-cookie";

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

    const validated = LogInFormSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    })

    if (!validated.success) {
        const fieldErrors = validated.error.flatten().fieldErrors
        state.errors.email = fieldErrors.email ?? []
        state.errors.password = fieldErrors.password ?? []
        return state
    }

    const body = validated.data
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
            await setAuthCookies(result)
            // Anything played on this device while logged out is synced by the browser once it has been redirected
            const secure = process.env.NODE_ENV === 'production';
            (await cookies()).set(SYNC_PENDING_COOKIE, '1', { secure, sameSite: 'lax', path: '/', maxAge: SYNC_PENDING_MAX_AGE });

        } else {
            result = await response.json()
            console.error(`Error when logging in with [Email: ${body.email}]: ${result.error}`)
            switch (response.status) {
                case 401:
                    state.errors.form.push('The provided username and password don\'t match!')
                    break
                default:
                    state.errors.form.push(`An error occurred on our end. Please try again later or reach out for support if this persists.`)
            }
            return state
        }
    } catch (error: any) {
        console.error(`Error when logging in with [Email: ${body.email}]: ${error.message}`)
        state!.errors.form.push('An error occurred on our end. Please try again later or reach out for support if this persists.')
        return state
    }

    redirect(safeNext(formData.get("next")));
}
