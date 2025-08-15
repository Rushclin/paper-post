'use client'

import { useState, useCallback } from 'react'
import { reviewSchema } from '@/src/libs/validation'

interface ValidationErrors {
  [key: string]: string
}

interface ReviewData {
  recommendation: string
  comments: string
  confidentialComments?: string
  technicalQuality: number
  novelty: number
  significance: number
  clarity: number
  overallScore: number
}

export function useReviewValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isValid, setIsValid] = useState(false)

  const validateField = useCallback((field: keyof ReviewData, value: string | number) => {
    const newErrors = { ...errors }

    try {
      // Valider le champ spécifique
      const fieldSchema = reviewSchema.pick({ [field]: true })
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

  const validateAll = useCallback((data: ReviewData) => {
    try {
      reviewSchema.parse(data)
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

  const hasError = useCallback((field: keyof ReviewData) => {
    return !!errors[field]
  }, [errors])

  const getError = useCallback((field: keyof ReviewData) => {
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