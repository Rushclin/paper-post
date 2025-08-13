
// components/articles/ArticleStats.tsx
'use client'

import { useState, useEffect } from 'react'

interface ArticleStatsData {
  total: number
  published: number
  drafts: number
  underReview: number
  accepted: number
  rejected: number
  citations: number
}

export default function ArticleStats() {
  const [stats, setStats] = useState<ArticleStatsData>({
    total: 0,
    published: 0,
    drafts: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
    citations: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/articles/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statItems = [
    {
      name: 'Total',
      value: stats.total,
      icon: '📄',
      color: 'bg-blue-500'
    },
    {
      name: 'Publiés',
      value: stats.published,
      icon: '✅',
      color: 'bg-green-500'
    },
    {
      name: 'Brouillons',
      value: stats.drafts,
      icon: '📝',
      color: 'bg-gray-500'
    },
    {
      name: 'En évaluation',
      value: stats.underReview,
      icon: '⏳',
      color: 'bg-yellow-500'
    },
    {
      name: 'Acceptés',
      value: stats.accepted,
      icon: '🎉',
      color: 'bg-purple-500'
    },
    {
      name: 'Citations',
      value: stats.citations,
      icon: '📊',
      color: 'bg-indigo-500'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <div key={item.name} className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${item.color} text-white mr-3`}>
              <span className="text-lg">{item.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{item.name}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
