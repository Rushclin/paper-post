
// components/articles/ArticleFilters.tsx
'use client'

import { useState } from 'react'
import { ArticleStatus } from '@prisma/client'

interface ArticleFiltersProps {
  onFilterChange: (filters: {
    search?: string
    status?: ArticleStatus | ''
    category?: string
  }) => void
  categories: Array<{ id: string; name: string }>
}

export default function ArticleFilters({ onFilterChange, categories }: ArticleFiltersProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ArticleStatus | ''>('')
  const [category, setCategory] = useState('')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({ search: value, status, category })
  }

  const handleStatusChange = (value: ArticleStatus | '') => {
    setStatus(value)
    onFilterChange({ search, status: value, category })
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    onFilterChange({ search, status, category: value })
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setCategory('')
    onFilterChange({ search: '', status: '', category: '' })
  }

  const hasActiveFilters = search || status || category

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher
          </label>
          <input
            type="text"
            placeholder="Titre, résumé, mots-clés..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ArticleStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillons</option>
            <option value="SUBMITTED">Soumis</option>
            <option value="UNDER_REVIEW">En évaluation</option>
            <option value="REVISION_REQUIRED">Révision requise</option>
            <option value="ACCEPTED">Acceptés</option>
            <option value="PUBLISHED">Publiés</option>
            <option value="REJECTED">Rejetés</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
