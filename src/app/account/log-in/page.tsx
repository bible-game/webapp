"use client"

import React, {useActionState, useState} from 'react'
import { Button } from '@heroui/button'
import { Form } from '@heroui/form'
import { Input } from '@heroui/input'
import { CircularProgress } from "@heroui/progress"
import { login } from "@/core/action/login"
import { LogInFormState } from "@/core/model/form-definitions"
import {Alert} from "@heroui/alert";

/**
 * Log-In Page
 * @since 6th June 2025
 */
export default function LogIn() {

    const [state, action, pending] = useActionState<LogInFormState, FormData>(login, undefined)

    const inputClassNames = {
        base: "flex-1 text-md border-[#ffffffff] border-radius rounded-3x1 px-2 pr-2 py-1 !opacity-100",
        label: "!text-[#ffffff66]",
    }

    const alertClassNames = {
        body: ""
    }

    return (
        <main>
            <div className="w-100">
                <Form action={action} validationErrors={state?.errors}>
                    <h1>Log In</h1>
                    <Input
                        classNames={inputClassNames}
                        label="Email"
                        variant="bordered"
                        type="email"
                        name="email"
                        required
                    />
                    <Input
                        classNames={inputClassNames}
                        type="password"
                        label="Password"
                        variant="bordered"
                        name="password"
                        required
                    />
                    {
                        state?.errors?.form &&
                        <div className="bg-transparent">
                            <Alert hideIcon variant="bordered" color="danger" description={state.errors.form[0]} />
                        </div>
                    }
                    <div className="mx-auto">
                        <Button type="submit" disabled={pending}>
                            { /* TODO: Update color used for button and spinner */ }
                            { pending && <CircularProgress aria-label="Checking credentials..." size="sm" color="secondary" /> || 'Submit' }
                        </Button>
                    </div>
                </Form>
            </div>
        </main>
    );

}