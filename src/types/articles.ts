// types/articles.ts
import { ArticleStatus } from '@prisma/client'

export interface ArticleFormData {
  title: string
  abstract: string
  content: string
  keywords: string
  categoryId: string
  language: string
  coAuthorEmails: string
  ethicsStatement: string
  conflictOfInterest: string
  coverLetter: string
}

export interface ArticleAuthor {
  id: string
  order: number
  isCorresponding: boolean
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
    title?: string
    affiliation?: string
  }
}

export interface ArticleSubmission {
  id: string
  status: 'PENDING' | 'ASSIGNED' | 'REVIEWING' | 'DECISION_MADE' | 'COMPLETED'
  submittedAt: string
  coverLetter?: string
  ethicsStatement?: string
  conflictOfInterest?: string
  reviews: ArticleReview[]
}

export interface ArticleReview {
  id: string
  recommendation: 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT'
  overallScore: number
  technicalQuality: number
  novelty: number
  significance: number
  clarity: number
  isCompleted: boolean
  submittedAt?: string
  dueDate?: string
  comments?: string
  confidentialComments?: string
  reviewer: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface Article {
  id: string
  title: string
  abstract: string
  content?: string
  keywords: string[]
  language: string
  status: ArticleStatus
  doi?: string
  manuscriptUrl?: string
  supplementaryFiles?: any
  pages?: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
  publishedAt?: string
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
    title?: string
    affiliation?: string
  }
  coAuthors: ArticleAuthor[]
  category: {
    id: string
    name: string
    slug: string
    description?: string
  }
  journal?: {
    id: string
    name: string
    issn?: string
  }
  issue?: {
    id: string
    volume: number
    number: number
    year: number
    title?: string
  }
  submissions: ArticleSubmission[]
  _count?: {
    reviews: number
    submissions: number
  }
}

export interface ArticleListFilters {
  search?: string
  status?: ArticleStatus
  category?: string
  page?: number
  limit?: number
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'submittedAt' | 'publishedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ArticleStats {
  total: number
  drafts: number
  submitted: number
  underReview: number
  revisionRequired: number
  accepted: number
  rejected: number
  published: number
  withdrawn: number
  citations: number
  averageReviewTime: number
  acceptanceRate: number
}

export interface CreateArticleRequest {
  title: string
  abstract: string
  content: string
  keywords: string[]
  categoryId: string
  language?: string
  coAuthorEmails?: string[]
  ethicsStatement?: string
  conflictOfInterest?: string
  coverLetter?: string
  submit?: boolean
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: string
}

export interface SubmitArticleRequest {
  coverLetter: string
  ethicsStatement: string
  conflictOfInterest: string
}

export interface UsePublicArticlesFilters {
  limit?: number
  page?: number
  category?: string
  search?: string
}

export interface UsePublicArticlesReturn {
  articles: Article[]
  loading: boolean
  error: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  refetch: () => void
  updateFilters: (filters: Partial<UsePublicArticlesFilters>) => void
}