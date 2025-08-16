import { UserRole } from '@prisma/client'

export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  title?: string
  affiliation?: string
  department?: string
  bio?: string
  orcid?: string
  researchInterests: string[]
  role: UserRole
  acceptTerms: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  title?: string
  affiliation?: string
  department?: string
  bio?: string
  orcid?: string
  researchInterests: string[]
  role: UserRole
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isVerified: boolean
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
  token?: string
  errors?: Record<string, string[]>
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}
export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  message: string
  errors?: ValidationError[]
  code?: string
}

// ================================
// TYPES POUR LES SESSIONS
// ================================

export interface SessionData {
  user: AuthUser
  expires: string
}

export interface LoginSession {
  isAuthenticated: boolean
  user: AuthUser | null
  loading: boolean
}

// ================================
// CONSTANTES
// ================================

export const USER_ROLES = {
  AUTHOR: 'AUTHOR',
  REVIEWER: 'REVIEWER', 
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
} as const

export const RESEARCH_INTERESTS = [
  'Intelligence Artificielle',
  'Machine Learning',
  'Data Science',
  'Cybersécurité',
  'Réseaux',
  'Algorithmes',
  'Bases de données',
  'Systèmes distribués',
  'Interface homme-machine',
  'Vision par ordinateur',
  'Traitement du langage naturel',
  'Bioinformatique',
  'Informatique quantique',
  'Blockchain',
  'Internet des objets',
  'Autre'
] as const

export const ACADEMIC_TITLES = [
  'M.',
  'Mme',
  'Dr.',
  'Prof.',
  'Prof. Dr.',
  'Ing.',
  'Ph.D.',
  'Autre'
] as const