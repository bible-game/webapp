
import { z } from 'zod'

export const LogInFormSchema = z.object({
    email: z.email('Please enter a valid email address').trim(),
    password: z.string()
})

export const SignUpFormSchema = z.object({
    email: z.email('Please enter a valid email address').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters long')
        .refine(value => new TextEncoder().encode(value).length <= 72, 'Password must be at most 72 UTF-8 bytes long'),
    firstname: z.string().trim().min(1, 'Please enter your first name'),
    lastname: z.string().trim().min(1, 'Please enter your last name'),
    church: z.string().trim(),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"]
})

export const ForgotPasswordFormSchema = z.object({
    email: z.email('Please enter a valid email address').trim(),
})

export const ResetPasswordFormSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters long')
        .refine(value => new TextEncoder().encode(value).length <= 72, 'Password must be at most 72 UTF-8 bytes long'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
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
            confirmPassword?: string[]
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
