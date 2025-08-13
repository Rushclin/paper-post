
// components/articles/ArticleCard.tsx
'use client'

import Link from 'next/link'
import { ArticleStatus } from '@prisma/client'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    abstract: string
    status: ArticleStatus
    keywords: string[]
    updatedAt: string
    category: {
      name: string
    }
    coAuthors: {
      author: {
        firstName: string
        lastName: string
      }
    }[]
  }
  onDelete?: (id: string, title: string) => void
  compact?: boolean
}

export default function ArticleCard({ article, onDelete, compact = false }: ArticleCardProps) {
  const getStatusBadge = (status: ArticleStatus) => {
    const statusConfig = {
      DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      SUBMITTED: { label: 'Soumis', color: 'bg-blue-100 text-blue-800' },
      UNDER_REVIEW: { label: 'En évaluation', color: 'bg-yellow-100 text-yellow-800' },
      REVISION_REQUIRED: { label: 'Révision requise', color: 'bg-orange-100 text-orange-800' },
      ACCEPTED: { label: 'Accepté', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
      PUBLISHED: { label: 'Publié', color: 'bg-purple-100 text-purple-800' },
      WITHDRAWN: { label: 'Retiré', color: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[status] || statusConfig.DRAFT
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getActionButtons = () => {
    const buttons = []

    // Voir l'article
    buttons.push(
      <Link
        key="view"
        href={`/dashboard/publications/${article.id}`}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
      >
        Voir
      </Link>
    )

    // Modifier (seulement brouillons et révisions requises)
    if (['DRAFT', 'REVISION_REQUIRED'].includes(article.status)) {
      buttons.push(
        <Link
          key="edit"
          href={`/dashboard/publications/${article.id}/edit`}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          Modifier
        </Link>
      )
    }

    // Supprimer (seulement brouillons)
    if (article.status === 'DRAFT' && onDelete) {
      buttons.push(
        <button
          key="delete"
          onClick={() => onDelete(article.id, article.title)}
          className="text-red-600 hover:text-red-900 text-sm font-medium"
        >
          Supprimer
        </button>
      )
    }

    // Soumettre (brouillons et révisions)
    if (['DRAFT', 'REVISION_REQUIRED'].includes(article.status)) {
      buttons.push(
        <Link
          key="submit"
          href={`/dashboard/publications/${article.id}/submit`}
          className="text-green-600 hover:text-green-900 text-sm font-medium"
        >
          Soumettre
        </Link>
      )
    }

    return buttons
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
            {article.title}
          </h3>
          {getStatusBadge(article.status)}
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {article.abstract}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{article.category.name}</span>
          <span>{new Date(article.updatedAt).toLocaleDateString('fr-FR')}</span>
        </div>
        
        <div className="flex space-x-2 text-sm">
          {getActionButtons().map((button, index) => (
            <span key={index}>{button}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            <Link 
              href={`/dashboard/publications/${article.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {article.title}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {article.abstract}
          </p>
        </div>
        <div className="ml-4">
          {getStatusBadge(article.status)}
        </div>
      </div>

      {/* Mots-clés */}
      {article.keywords.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {article.keywords.slice(0, 4).map((keyword, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {keyword}
              </span>
            ))}
            {article.keywords.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{article.keywords.length - 4} autres
              </span>
            )}
          </div>
        </div>
      )}

      {/* Informations */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>📂 {article.category.name}</span>
          {article.coAuthors.length > 0 && (
            <span>
              👥 {article.coAuthors.length} co-auteur{article.coAuthors.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span>Modifié le {new Date(article.updatedAt).toLocaleDateString('fr-FR')}</span>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4 border-t">
        {getActionButtons().map((button, index) => (
          <span key={index}>{button}</span>
        ))}
      </div>
    </div>
  )
}
