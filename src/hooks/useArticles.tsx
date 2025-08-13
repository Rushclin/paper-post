// hooks/useArticles.ts
'use client'

import { useState, useEffect } from 'react'
import { ArticleStatus } from '@prisma/client'

interface Article {
  id: string
  title: string
  abstract: string
  status: ArticleStatus
  createdAt: string
  updatedAt: string
  submittedAt?: string
  publishedAt?: string
  keywords: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  coAuthors: {
    id: string
    order: number
    author: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }[]
  _count: {
    reviews: number
    submissions: number
  }
}

interface UseArticlesFilters {
  status?: ArticleStatus
  search?: string
  category?: string
  page?: number
  limit?: number
}

interface UseArticlesReturn {
  articles: Article[]
  loading: boolean
  error: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  refetch: () => void
  deleteArticle: (id: string) => Promise<boolean>
  updateFilters: (filters: Partial<UseArticlesFilters>) => void
}

export function useArticles(initialFilters: UseArticlesFilters = {}): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<UseArticlesFilters>({
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

  const fetchArticles = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.status) params.set('status', filters.status)
      if (filters.search) params.set('search', filters.search)
      if (filters.category) params.set('category', filters.category)

      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/articles?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setArticles(data.articles)
        setPagination(data.pagination)
      } else {
        setError(data.message || 'Erreur lors du chargement des articles')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const deleteArticle = async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setArticles(articles.filter(a => a.id !== id))
        return true
      } else {
        setError(data.message || 'Erreur lors de la suppression')
        return false
      }
    } catch (error) {
      setError('Erreur de connexion')
      return false
    }
  }

  const updateFilters = (newFilters: Partial<UseArticlesFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })) // Reset page when filters change
  }

  const refetch = () => {
    fetchArticles()
  }

  useEffect(() => {
    fetchArticles()
  }, [filters])

  return {
    articles,
    loading,
    error,
    pagination,
    refetch,
    deleteArticle,
    updateFilters
  }
}

