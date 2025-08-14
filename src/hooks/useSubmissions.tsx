// hooks/useSubmissions.ts
'use client'

import { useState, useEffect } from 'react'

interface Submission {
  id: string
  status: 'PENDING' | 'ASSIGNED' | 'REVIEWING' | 'DECISION_MADE' | 'COMPLETED'
  submittedAt: string
  coverLetter?: string
  ethicsStatement?: string
  conflictOfInterest?: string
  article: {
    id: string
    title: string
    abstract: string
    status: string
    keywords: string[]
    category: { name: string }
    author: {
      id: string
      firstName: string
      lastName: string
      email: string
      affiliation?: string
    }
    coAuthors: {
      author: {
        firstName: string
        lastName: string
      }
    }[]
  }
  submitter: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  editorAssignments: {
    editor: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }[]
  reviews: {
    id: string
    recommendation: string
    overallScore: number
    isCompleted: boolean
    submittedAt?: string
    reviewer: {
      id: string
      firstName: string
      lastName: string
    }
  }[]
}

interface UseSubmissionsFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
}

interface UseSubmissionsReturn {
  submissions: Submission[]
  loading: boolean
  error: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  refetch: () => void
  updateFilters: (filters: Partial<UseSubmissionsFilters>) => void
}

export function useSubmissions(initialFilters: UseSubmissionsFilters = {}): UseSubmissionsReturn {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<UseSubmissionsFilters>({
    page: 1,
    limit: 10,
    ...initialFilters
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchSubmissions = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.status) params.set('status', filters.status)
      if (filters.search) params.set('search', filters.search)

      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/submissions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setSubmissions(data.submissions)
        setPagination(data.pagination)
      } else {
        setError(data.message || 'Erreur lors du chargement des soumissions')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<UseSubmissionsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const refetch = () => {
    fetchSubmissions()
  }

  useEffect(() => {
    fetchSubmissions()
  }, [filters])

  return {
    submissions,
    loading,
    error,
    pagination,
    refetch,
    updateFilters
  }
}