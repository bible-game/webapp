"use server"

import { SignUpFormState } from "@/core/model/form-definitions"
import { State } from "@/core/model/state/state";

export async function signup(state: SignUpFormState, formData: FormData) {

    if (!state) {
        state = {
            errors: {
                email: [],
                password: [],
                firstname: [],
                lastname: [],
                church: [],
                form: []
            },
            token: undefined
        }
    } else {
        state.errors = {
            email: [],
            password: [],
            firstname: [],
            lastname: [],
            church: [],
            form: []
        }
        state.token = undefined
    }

    const body = {
        email: formData.get("email"),
        password: formData.get("password"),
        firstname: formData.get("firstname"),
        lastname: formData.get("lastname"),
        church: formData.get("church"),

        games: overall.games,
        reviews: overall.reviews,
        reads: overall.reads
    }

    try {
        const response = await fetch(`${process.env.SVC_USER}/auth/register`, {
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
            state!.success = true

        } else {
            result = await response.json()
            console.error(`Error when signing up with [Email: ${body.email}, Password: ${body.password}, Firstname: ${body.firstname}, Lastname: ${body.lastname}, Church: ${body.church}]: ${result.error}`)
            switch (response.status) {
                case 401:
                    state.errors.form.push('The provided username and password don\'t match!')
                    break
                default:
                    state.errors.form.push(`An error occurred on our end. Please try again later or reach out for support if this persists.`)
            }
        }
    } catch (error: any) {
        console.error(`Error when signing up with [Email: ${body.email}, Password: ${body.password}, Firstname: ${body.firstname}, Lastname: ${body.lastname}, Church: ${body.church}]: ${error.message}`)
        state!.errors.form.push('An error occurred on our end. Please try again later or reach out for support if this persists.')
    }
    return state
}