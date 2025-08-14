
// hooks/usePublicStats.ts
'use client'

import { useState, useEffect } from 'react'

interface PublicStats {
  totalArticles: number
  totalAuthors: number
  totalCategories: number
  recentArticles: number
}

interface UsePublicStatsReturn {
  stats: PublicStats
  loading: boolean
  error: string
  refetch: () => void
}

export function usePublicStats(): UsePublicStatsReturn {
  const [stats, setStats] = useState<PublicStats>({
    totalArticles: 0,
    totalAuthors: 0,
    totalCategories: 0,
    recentArticles: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/public/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.message || 'Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchStats()
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch
  }
}