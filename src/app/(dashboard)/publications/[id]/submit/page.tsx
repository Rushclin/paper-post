// app/(dashboard)/publications/[id]/submit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSubmissionValidation } from '@/src/hooks/useSubmissionValidation'

interface SubmissionFormData {
  coverLetter: string
  ethicsStatement: string
  conflictOfInterest: string
}

function SubmitArticleContent() {
  const params = useParams()
  const router = useRouter()
  const articleId = params.id as string

  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<SubmissionFormData>({
    coverLetter: '',
    ethicsStatement: '',
    conflictOfInterest: ''
  })

  const { validateField, validateAll, hasError, getError, clearErrors } = useSubmissionValidation()

  useEffect(() => {
    fetchArticle()
  }, [articleId])

  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/articles/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setArticle(data.article)
        
        // Vérifier si l'article peut être soumis
        if (!['DRAFT', 'REVISION_REQUIRED'].includes(data.article.status)) {
          setError('Cet article ne peut pas être soumis dans son état actuel')
        }
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Erreur lors du chargement de l\'article')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof SubmissionFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    
    // Validation en temps réel
    validateField(field, value)
  }

  const validateForm = () => {
    const validation = validateAll(formData)
    return validation.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir soumettre cet article pour évaluation ? Cette action ne peut pas être annulée.')) {
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/articles/${articleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Article soumis avec succès pour évaluation')
        router.push('/dashboard/publications')
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
          <div className="mt-4">
            <Link
              href="/dashboard/publications"
              className="text-red-600 hover:text-red-500 font-medium"
            >
              ← Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">Article non trouvé</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/publications/${articleId}`}
          className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
        >
          ← Retour à l'article
        </Link>
      </div>

      {/* Informations de l'article */}
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Soumettre l'article pour évaluation
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h2 className="font-medium text-blue-900 mb-2">{article.title}</h2>
          <p className="text-sm text-blue-700">
            Catégorie: {article.category.name}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Une fois soumis, vous ne pourrez plus modifier l'article jusqu'à la décision des reviewers</li>
                  <li>Le processus d'évaluation peut prendre 4 à 8 semaines</li>
                  <li>Vous recevrez une notification par email à chaque étape</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de soumission */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Informations de soumission
        </h2>

        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
            Lettre d'accompagnement *
          </label>
          <textarea
            id="coverLetter"
            rows={6}
            value={formData.coverLetter}
            onChange={(e) => handleInputChange('coverLetter', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Expliquez pourquoi votre article mérite d'être publié dans cette revue, sa contribution originale au domaine, et toute information pertinente pour les éditeurs."
          />
          {hasError('coverLetter') && (
            <p className="mt-1 text-sm text-red-600">{getError('coverLetter')}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.coverLetter.length} caractères (minimum 100)
          </p>
        </div>

        <div>
          <label htmlFor="ethicsStatement" className="block text-sm font-medium text-gray-700 mb-2">
            Déclaration d'éthique *
          </label>
          <textarea
            id="ethicsStatement"
            rows={4}
            value={formData.ethicsStatement}
            onChange={(e) => handleInputChange('ethicsStatement', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez les considérations éthiques de votre recherche, l'approbation des comités d'éthique, le consentement des participants, etc."
          />
          {hasError('ethicsStatement') && (
            <p className="mt-1 text-sm text-red-600">{getError('ethicsStatement')}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.ethicsStatement.length} caractères (minimum 50)
          </p>
        </div>

        <div>
          <label htmlFor="conflictOfInterest" className="block text-sm font-medium text-gray-700 mb-2">
            Déclaration de conflit d'intérêts *
          </label>
          <textarea
            id="conflictOfInterest"
            rows={3}
            value={formData.conflictOfInterest}
            onChange={(e) => handleInputChange('conflictOfInterest', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Déclarez tout conflit d'intérêts potentiel ou indiquez 'Aucun conflit d'intérêts à déclarer'"
          />
          {hasError('conflictOfInterest') && (
            <p className="mt-1 text-sm text-red-600">{getError('conflictOfInterest')}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.conflictOfInterest.length} caractères (minimum 20)
          </p>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Link
            href={`/dashboard/publications/${articleId}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Soumission en cours...' : 'Soumettre pour évaluation'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function SubmitArticlePage() {
  return (
      <SubmitArticleContent />
  )
}
