
import { z } from 'zod'

export const LogInFormSchema = z.object({
    email: z.string().email('Please enter a valid email address').trim(),
    password: z.string().trim()
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
