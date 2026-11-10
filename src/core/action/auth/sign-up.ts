"use server"

import { SignUpFormSchema, SignUpFormState } from "@/core/model/form/form-definitions"
import { z } from "zod"
import { setAuthCookies } from "@/core/util/auth-cookies"

export async function signup(state: SignUpFormState, formData: FormData): Promise<SignUpFormState> {

    if (!state) {
        state = {
            errors: {
                email: [],
                password: [],
                confirmPassword: [],
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
            confirmPassword: [],
            firstname: [],
            lastname: [],
            church: [],
            form: []
        }
        state.token = undefined
        state.success = false
    }

    // Bot protection: Honeypot check
    if (formData.get("website")) {
        console.warn("Honeypot triggered by sign-up attempt.");
        state.errors.form.push("Unable to process request at this time.");
        return state;
    }

    // Server-side validation
    const validatedFields = SignUpFormSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        firstname: formData.get("firstname"),
        lastname: formData.get("lastname"),
        church: formData.get("church"),
    });

    if (!validatedFields.success) {
        return {
            errors: {
                email: [],
                password: [],
                confirmPassword: [],
                firstname: [],
                lastname: [],
                church: [],
                form: [],
                ...z.flattenError(validatedFields.error).fieldErrors
            } as any,
            token: undefined,
            success: undefined
        };
    }

    const { confirmPassword, ...dataToSend } = validatedFields.data;

    try {
        const body = {
            ...dataToSend,
            games: JSON.parse(formData.get("games") as string || '[]'),
            reviews: JSON.parse(formData.get("reviews") as string || '[]'),
            reads: JSON.parse(formData.get("reads") as string || '[]')
        }

        const response = await fetch(`${process.env.SVC_USER}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            cache: "no-store",
            body: JSON.stringify(body)
        })

        if (response.ok) {
            const result = await response.text()
            await setAuthCookies(result)
            state!.success = true
        } else {
            console.error(`Sign-up failed with status ${response.status}`)
            if (response.status === 409) {
                state.errors.email.push("This email is already registered.")
            } else {
                state.errors.form.push("An error occurred during account creation. Please try again.")
            }
        }
    } catch (error: any) {
        console.error(`Fetch error during sign-up: ${error.message}`)
        state!.errors.form.push('Our systems are currently busy. Please try again later.')
    }
    return state
}