
import { z } from 'zod'

export const LogInFormSchema = z.object({
    email: z.string().email('Please enter a valid email address').trim(),
    password: z.string().trim()
})

export const SignUpFormSchema = z.object({
    email: z.string().email('Please enter a valid email address').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters long').trim(),
    firstname: z.string().trim().min(2, 'Name must be at least 2 characters')
        .regex(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens')
        .refine((val) => !/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(val), "Name looks invalid (too many consonants)")
        .refine((val) => (val.match(/[a-z][A-Z]/g) || []).length <= 1, "Name looks invalid (suspicious capitalization)"),
    lastname: z.string().trim().min(2, 'Name must be at least 2 characters')
        .regex(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens')
        .refine((val) => !/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(val), "Name looks invalid (too many consonants)")
        .refine((val) => (val.match(/[a-z][A-Z]/g) || []).length <= 1, "Name looks invalid (suspicious capitalization)"),
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
