
import { z } from 'zod'

export const LogInFormSchema = z.object({
    email: z.string().email('Please enter a valid email address').trim(),
    password: z.string().trim()
})

export const SignUpFormSchema = z.object({
    email: z.string().email('Please enter a valid email address').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters long').trim(),
    firstname: z.string().trim(),
    lastname: z.string().trim(),
    church: z.string().trim()
})

export type LogInFormState =
    | {
        errors: {
            email: string[]
            password: string[]
            form: string[]
        }
        token?: string
      }
    | undefined

export type SignUpFormState =
    | {
        errors: {
            email: string[]
            password: string[]
            firstname: string[]
            lastname: string[]
            church: string[]
            form: string[]
        }
        token?: string
        success?: boolean
      }
    | undefined
