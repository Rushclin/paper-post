'use client'

import { useState, useCallback } from 'react'
import { z } from 'zod'
import { loginSchema, registerSchema } from '@/src/libs/validation'
import type { LoginFormData, RegisterFormData } from '@/src/types/auth'

interface ValidationErrors {
  [key: string]: string
}

function useZodValidation<T extends Record<string, any>>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isValid, setIsValid] = useState(false)

  const validateField = useCallback((field: keyof T, value: unknown, allData?: T) => {
    const newErrors = { ...errors }

    try {
      // Si on a toutes les données, on valide le schéma complet
      if (allData) {
        schema.parse(allData)
        // Si la validation complète passe, supprimer toutes les erreurs
        delete newErrors[field as string]
      } else {
        // Sinon, on crée un objet partiel pour valider juste ce champ
        const fieldData = { [field]: value } as Partial<T>
        
        // Validation du champ spécifique en utilisant le schéma partiel
        try {
          (schema as any).pick({ [field]: true }).parse(fieldData)
          delete newErrors[field as string]
        } catch (fieldError) {
          if (fieldError instanceof z.ZodError) {
            const issue = fieldError.issues[0]
            if (issue) {
              newErrors[field as string] = issue.message
            }
          }
        }
      }
    } catch (validationError) {
      // Ajouter l'erreur pour la validation complète
      if (validationError instanceof z.ZodError) {
        const fieldError = validationError.issues.find(
          (error: any) => error.path.length > 0 && error.path[0] === field
        )
        if (fieldError) {
          newErrors[field as string] = fieldError.message
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [errors, schema])

  const validateAll = useCallback((data: T) => {
    try {
      schema.parse(data)
      setErrors({})
      setIsValid(true)
      return { isValid: true, errors: {} }
    } catch (validationError) {
      const newErrors: ValidationErrors = {}
      
      if (validationError instanceof z.ZodError) {
        validationError.issues.forEach((error: any) => {
          if (error.path && error.path.length > 0) {
            newErrors[error.path[0] as string] = error.message
          }
        })
      }
      
      setErrors(newErrors)
      setIsValid(false)
      return { isValid: false, errors: newErrors }
    }
  }, [schema])

  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(false)
  }, [])

  const hasError = useCallback((field: keyof T) => {
    return !!errors[field as string]
  }, [errors])

  const getError = useCallback((field: keyof T) => {
    return errors[field as string] || ''
  }, [errors])

  return {
    errors,
    isValid,
    validateField,
    validateAll,
    clearErrors,
    hasError,
    getError
  }
}

export function useLoginValidation() {
  return useZodValidation<LoginFormData>(loginSchema)
}

export function useRegisterValidation() {
  return useZodValidation<RegisterFormData>(registerSchema)
}