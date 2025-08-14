// hooks/useSubmission.ts
'use client'

import { useState, useEffect } from 'react'

export function useSubmission(submissionId: string) {
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSubmission = async () => {
    if (!submissionId) return

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/submissions/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setSubmission(data.submission)
      } else {
        setError(data.message || 'Soumission non trouvée')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const assignReviewers = async (reviewerIds: string[]) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/submissions/${submissionId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewerIds })
      })

      const data = await response.json()
      
      if (data.success) {
        fetchSubmission() // Refresh data
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' }
    }
  }

  const submitReview = async (reviewData: any) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      })

      const data = await response.json()
      
      if (data.success) {
        fetchSubmission() // Refresh data
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' }
    }
  }

  const makeDecision = async (decision: string, editorComments?: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/submissions/${submissionId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision, editorComments })
      })

      const data = await response.json()
      
      if (data.success) {
        fetchSubmission() // Refresh data
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' }
    }
  }

  const refetch = () => {
    fetchSubmission()
  }

  useEffect(() => {
    fetchSubmission()
  }, [submissionId])

  return {
    submission,
    loading,
    error,
    refetch,
    assignReviewers,
    submitReview,
    makeDecision
  }
}