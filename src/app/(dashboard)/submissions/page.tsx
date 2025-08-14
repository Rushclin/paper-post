// app/(dashboard)/submissions/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserRole } from '@prisma/client'
import { useSubmissions } from '@/src/hooks/useSubmissions'
import { useAuth } from '@/src/hooks/useAuth'
import ProtectedRoute from '@/src/components/auth/ProtectedRoute'

function SubmissionsListContent() {
  const { user } = useAuth()
  const { submissions, loading, error, pagination, updateFilters } = useSubmissions()
  const [filters, setFilters] = useState({ search: '', status: '' })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'En attente', color: 'bg-gray-100 text-gray-800' },
      ASSIGNED: { label: 'Assigné', color: 'bg-blue-100 text-blue-800' },
      REVIEWING: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
      DECISION_MADE: { label: 'Décision prise', color: 'bg-purple-100 text-purple-800' },
      COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getArticleStatusBadge = (status: string) => {
    const statusConfig = {
      SUBMITTED: { label: 'Soumis', color: 'bg-blue-100 text-blue-800' },
      UNDER_REVIEW: { label: 'En évaluation', color: 'bg-yellow-100 text-yellow-800' },
      REVISION_REQUIRED: { label: 'Révision requise', color: 'bg-orange-100 text-orange-800' },
      ACCEPTED: { label: 'Accepté', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SUBMITTED
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getActionsForSubmission = (submission: any) => {
    const actions = []

    // Voir le détail (tous les rôles autorisés)
    actions.push(
      <Link
        key="view"
        href={`/submissions/${submission.id}`}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
      >
        Voir
      </Link>
    )

    // Assigner des reviewers (ADMIN et EDITOR seulement)
    if ((user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR) && 
        submission.status === 'PENDING') {
      actions.push(
        <Link
          key="assign"
          href={`/submissions/${submission.id}/assign`}
          className="text-green-600 hover:text-green-900 text-sm font-medium"
        >
          Assigner
        </Link>
      )
    }

    // Faire une review (si assigné comme reviewer)
    const isAssigned = submission.editorAssignments.some((ea: any) => ea.editor.id === user?.id)
    const hasReviewed = submission.reviews.some((r: any) => r.reviewer.id === user?.id && r.isCompleted)
    
    if (isAssigned && !hasReviewed && submission.status === 'ASSIGNED') {
      actions.push(
        <Link
          key="review"
          href={`/submissions/${submission.id}/review`}
          className="text-purple-600 hover:text-purple-900 text-sm font-medium"
        >
          Évaluer
        </Link>
      )
    }

    // Prendre une décision finale (ADMIN et EDITOR seulement)
    if ((user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR) && 
        submission.status === 'DECISION_MADE') {
      actions.push(
        <Link
          key="decide"
          href={`/submissions/${submission.id}/decision`}
          className="text-orange-600 hover:text-orange-900 text-sm font-medium"
        >
          Décision
        </Link>
      )
    }

    return actions
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des soumissions</h1>
          <p className="text-gray-600">
            {user?.role === UserRole.REVIEWER 
              ? 'Soumissions qui vous sont assignées'
              : 'Gérez les soumissions d\'articles'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {pagination.total} soumission{pagination.total > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Titre, auteur..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="ASSIGNED">Assigné</option>
              <option value="REVIEWING">En cours</option>
              <option value="DECISION_MADE">Décision prise</option>
              <option value="COMPLETED">Terminé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Liste des soumissions */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune soumission trouvée
          </h3>
          <p className="text-gray-600">
            {user?.role === UserRole.REVIEWER 
              ? 'Aucune soumission ne vous est actuellement assignée.'
              : 'Aucune soumission ne correspond à vos critères de recherche.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut soumission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soumis le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {submission.article.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {submission.article.abstract.substring(0, 100)}...
                        </div>
                        <div className="mt-1">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {submission.article.category.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.article.author.firstName} {submission.article.author.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.article.author.affiliation}
                      </div>
                      {submission.article.coAuthors.length > 0 && (
                        <div className="text-xs text-gray-500">
                          +{submission.article.coAuthors.length} co-auteur{submission.article.coAuthors.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getArticleStatusBadge(submission.article.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.reviews.filter(r => r.isCompleted).length} / {submission.editorAssignments.length}
                      </div>
                      <div className="text-xs text-gray-500">
                        terminées
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex space-x-2 justify-end">
                        {getActionsForSubmission(submission).map((action, index) => (
                          <span key={index}>{action}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  {pagination.page > 1 && (
                    <button
                      onClick={() => updateFilters({ page: pagination.page - 1 })}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                  )}
                  {pagination.page < pagination.pages && (
                    <button
                      onClick={() => updateFilters({ page: pagination.page + 1 })}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  )}
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      à{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      sur{' '}
                      <span className="font-medium">{pagination.total}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => updateFilters({ page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SubmissionsListPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER]}>
      <SubmissionsListContent />
    </ProtectedRoute>
  )
}