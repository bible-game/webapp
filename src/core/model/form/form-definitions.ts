
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

export const ForgotPasswordFormSchema = z.object({
    email: z.string().email('Please enter a valid email address').trim(),
})

export const ResetPasswordFormSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters long').trim(),
    confirmPassword: z.string().trim()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
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

export type ForgotPasswordFormState =
    | {
        errors: {
            email: string[]
            form: string[]
        }
        success?: boolean
      }
    | undefined

export type ResetPasswordFormState =
    | {
        errors: {
            password: string[]
            confirmPassword: string[]
            form: string[]
        }
        success?: boolean
      }
    | undefined
