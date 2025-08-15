'use client'

import { useState, useCallback } from 'react'
import { submissionSchema } from '@/src/libs/validation'

interface ValidationErrors {
  [key: string]: string
}

interface SubmissionData {
  coverLetter: string
  ethicsStatement: string
  conflictOfInterest: string
}

export function useSubmissionValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isValid, setIsValid] = useState(false)

  const validateField = useCallback((field: keyof SubmissionData, value: string) => {
    const newErrors = { ...errors }

    try {
      // Valider le champ spécifique
      const fieldSchema = submissionSchema.pick({ [field]: true })
      fieldSchema.parse({ [field]: value })
      
      // Si pas d'erreur, supprimer l'erreur existante
      delete newErrors[field]
    } catch (validationError: any) {
      // Ajouter l'erreur
      if (validationError.errors && validationError.errors.length > 0) {
        newErrors[field] = validationError.errors[0].message
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [errors])

  const validateAll = useCallback((data: SubmissionData) => {
    try {
      submissionSchema.parse(data)
      setErrors({})
      setIsValid(true)
      return { isValid: true, errors: {} }
    } catch (validationError: any) {
      const newErrors: ValidationErrors = {}
      
      if (validationError.errors) {
        validationError.errors.forEach((error: any) => {
          if (error.path && error.path.length > 0) {
            newErrors[error.path[0]] = error.message
          }
        })
      }
      
      setErrors(newErrors)
      setIsValid(false)
      return { isValid: false, errors: newErrors }
    }
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(false)
  }, [])

  const hasError = useCallback((field: keyof SubmissionData) => {
    return !!errors[field]
  }, [errors])

  const getError = useCallback((field: keyof SubmissionData) => {
    return errors[field] || ''
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