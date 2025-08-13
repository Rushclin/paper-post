// components/articles/ArticleSearch.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ArticleSearchProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function ArticleSearch({ 
  onSearch, 
  placeholder = "Rechercher dans vos articles..." 
}: ArticleSearchProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(query)
    } else {
      // Navigation par défaut
      const params = new URLSearchParams()
      if (query) params.set('search', query)
      router.push(`/dashboard/publications?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-lg">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}
