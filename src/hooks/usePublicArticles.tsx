// hooks/usePublicArticles.ts
'use client'

import { useState, useEffect } from 'react'

interface PublicArticle {
  id: string
  title: string
  abstract: string
  keywords: string[]
  publishedAt: string
  doi?: string
  author: {
    id: string
    firstName: string
    lastName: string
    title?: string
    affiliation?: string
    department?: string
  }
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
      title?: string
      affiliation?: string
    }
  }[]
  journal?: {
    id: string
    name: string
    issn?: string
  }
  issue?: {
    id: string
    volume: number
    number: number
    year: number
  }
  _count: {
    reviews: number
  }
}

interface UsePublicArticlesFilters {
  limit?: number
  page?: number
  category?: string
  search?: string
}

interface UsePublicArticlesReturn {
  articles: PublicArticle[]
  loading: boolean
  error: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  refetch: () => void
  updateFilters: (filters: Partial<UsePublicArticlesFilters>) => void
}

export function usePublicArticles(initialFilters: UsePublicArticlesFilters = {}): UsePublicArticlesReturn {
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<UsePublicArticlesFilters>({
    limit: 5,
    page: 1,
    ...initialFilters
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  })

  const fetchArticles = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.category) params.set('category', filters.category)
      if (filters.search) params.set('search', filters.search)

      const response = await fetch(`/api/public/articles?${params.toString()}`)
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

  const updateFilters = (newFilters: Partial<UsePublicArticlesFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
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
    updateFilters
  }
}