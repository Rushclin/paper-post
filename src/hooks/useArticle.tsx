// hooks/useArticle.ts
'use client'

import { useState, useEffect } from 'react'

interface UseArticleReturn {
  article: any | null
  loading: boolean
  error: string
  refetch: () => void
  submitArticle: (submissionData: any) => Promise<boolean>
}

export function useArticle(articleId: string): UseArticleReturn {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchArticle = async () => {
    if (!articleId) return

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/articles/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setArticle(data.article)
      } else {
        setError(data.message || 'Article non trouvé')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const submitArticle = async (submissionData: any): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/articles/${articleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      })

      const data = await response.json()

      if (data.success) {
        fetchArticle() // Refresh article data
        return true
      } else {
        setError(data.message || 'Erreur lors de la soumission')
        return false
      }
    } catch (error) {
      setError('Erreur de connexion')
      return false
    }
  }

  const refetch = () => {
    fetchArticle()
  }

  useEffect(() => {
    fetchArticle()
  }, [articleId])

  return {
    article,
    loading,
    error,
    refetch,
    submitArticle
  }
}
