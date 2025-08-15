'use client'

import { useState, useEffect } from 'react'

interface SubmissionStatsData {
  total: number
  pending: number
  reviewing: number
  decisionMade: number
  completed: number
  acceptanceRate: number
  averageReviewTime: number
}

export function SubmissionStats() {
  const [stats, setStats] = useState<SubmissionStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/submissions/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: 'Total soumissions',
      value: stats.total,
      color: 'text-blue-600'
    },
    {
      label: 'En attente',
      value: stats.pending,
      color: 'text-gray-600'
    },
    {
      label: 'En évaluation',
      value: stats.reviewing,
      color: 'text-yellow-600'
    },
    {
      label: 'Terminées',
      value: stats.completed,
      color: 'text-green-600'
    }
  ]

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Statistiques des soumissions
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {stats.acceptanceRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              Taux d'acceptation
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {stats.averageReviewTime} jours
            </div>
            <div className="text-sm text-gray-500">
              Durée moyenne de révision
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}