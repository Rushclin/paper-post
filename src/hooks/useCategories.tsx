
// hooks/useCategories.ts
'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  children?: Category[]
  _count?: {
    articles: number
  }
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string
  refetch: () => void
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories)
      } else {
        setError(data.message || 'Erreur lors du chargement des catégories')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchCategories()
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch
  }
}
