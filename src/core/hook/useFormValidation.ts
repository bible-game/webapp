'use client'

import { useState, useCallback } from 'react'
import { ZodType } from 'zod'

type FieldErrors = Record<string, string | undefined>

export function useFormValidation(schema: ZodType) {
    const [errors, setErrors] = useState<FieldErrors>({})

    const validateField = useCallback((name: string, value: string, allValues: Record<string, string>) => {
        const result = schema.safeParse({ ...allValues, [name]: value })
        if (result.success) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        } else {
            const fieldError = result.error.issues.find(i => i.path.includes(name))
            setErrors(prev => ({ ...prev, [name]: fieldError?.message }))
        }
    }, [schema])

    const clearFieldError = useCallback((name: string) => {
        setErrors(prev => ({ ...prev, [name]: undefined }))
    }, [])

    const getFieldProps = useCallback((name: string) => ({
        isInvalid: !!errors[name],
        errorMessage: errors[name],
    }), [errors])

    const validateAll = useCallback((values: Record<string, string>): boolean => {
        const result = schema.safeParse(values)
        if (result.success) {
            setErrors({})
            return true
        }
        const newErrors: FieldErrors = {}
        for (const issue of result.error.issues) {
            const field = issue.path[0] as string
            if (!newErrors[field]) {
                newErrors[field] = issue.message
            }
        }
        setErrors(newErrors)
        return false
    }, [schema])

    const clearAllErrors = useCallback(() => {
        setErrors({})
    }, [])

    return { validateField, clearFieldError, getFieldProps, validateAll, clearAllErrors }
}
