"use client"

import React, { FormEvent } from 'react'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { Form } from '@heroui/form'
import { UserAuthService } from '@/core/service/user-auth-service'

/**
 * Log-In Page
 * @since 6th June 2025
 */
export default async function LogIn() {

    const inputClassNames = {
        base: "flex-1 text-md border-[#ffffffff] border-radius rounded-3x1 px-2 pr-2 py-1 !opacity-100",
        label: "!text-[#ffffff66]"
    }

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()

        const data = Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement))
        console.log(data)

        UserAuthService.login([data.email as string, data.password as string])
    }

    return (
            <main>
                <div className="w-100">
                    <Form onSubmit={onSubmit}>
                        <h1>Log In</h1>
                        <Input
                            classNames={inputClassNames}
                            label="Email"
                            variant="bordered"
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
                        <Button type="submit">Submit</Button>
                    </Form>
                </div>
            </main>
    );

}