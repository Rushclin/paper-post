
// utils/articleHelpers.ts
import { ArticleStatus } from '@prisma/client'

export const getStatusLabel = (status: ArticleStatus): string => {
  const labels = {
    DRAFT: 'Brouillon',
    SUBMITTED: 'Soumis',
    UNDER_REVIEW: 'En évaluation',
    REVISION_REQUIRED: 'Révision requise',
    ACCEPTED: 'Accepté',
    REJECTED: 'Rejeté',
    PUBLISHED: 'Publié',
    WITHDRAWN: 'Retiré'
  }
  return labels[status] || 'Inconnu'
}

export const getStatusColor = (status: ArticleStatus): string => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    REVISION_REQUIRED: 'bg-orange-100 text-orange-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PUBLISHED: 'bg-purple-100 text-purple-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || colors.DRAFT
}

export const canEdit = (status: ArticleStatus): boolean => {
  return ['DRAFT', 'REVISION_REQUIRED'].includes(status)
}

export const canDelete = (status: ArticleStatus): boolean => {
  return status === 'DRAFT'
}

export const canSubmit = (status: ArticleStatus): boolean => {
  return ['DRAFT', 'REVISION_REQUIRED'].includes(status)
}

export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  })
}

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Aujourd\'hui'
  if (diffInDays === 1) return 'Hier'
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`
  
  return `Il y a ${Math.floor(diffInDays / 365)} ans`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export const generateCitation = (article: any, format: 'apa' | 'mla' | 'chicago' = 'apa'): string => {
  const authors = [article.author, ...article.coAuthors.map((ca: any) => ca.author)]
  const authorsText = authors.map((author: any) => 
    `${author.lastName}, ${author.firstName.charAt(0)}.`
  ).join(', ')

  const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : new Date().getFullYear()

  switch (format) {
    case 'apa':
      return `${authorsText} (${year}). ${article.title}. ${article.journal?.name || 'Revue Scientifique'}.`
    
    case 'mla':
      return `${authorsText} "${article.title}." ${article.journal?.name || 'Revue Scientifique'}, ${year}.`
    
    case 'chicago':
      return `${authorsText} "${article.title}." ${article.journal?.name || 'Revue Scientifique'} (${year}).`
    
    default:
      return `${authorsText} (${year}). ${article.title}. ${article.journal?.name || 'Revue Scientifique'}.`
  }
}