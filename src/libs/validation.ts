// lib/validation.ts
import { z } from 'zod'
import { USER_ROLES } from '../types/auth'
// import { USER_ROLES } from '@/types/auth'

export const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'Email requis'),
  password: z.string()
    .min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional()
})

export const registerSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'Email requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
           'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string(),
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  title: z.string().optional(),
  affiliation: z.string()
    .min(2, 'L\'affiliation doit contenir au moins 2 caractères')
    .max(200, 'L\'affiliation ne peut pas dépasser 200 caractères')
    .optional(),
  department: z.string()
    .max(100, 'Le département ne peut pas dépasser 100 caractères')
    .optional(),
  bio: z.string()
    .max(1000, 'La biographie ne peut pas dépasser 1000 caractères')
    .optional(),
  orcid: z.string()
    .regex(/^(\d{4}-){3}\d{3}[\dX]$/, 'Format ORCID invalide (ex: 0000-0000-0000-0000)')
    .optional()
    .or(z.literal('')),
  researchInterests: z.array(z.string()).min(1, 'Au moins un domaine de recherche requis'),
  role: z.enum([USER_ROLES.AUTHOR, USER_ROLES.REVIEWER, USER_ROLES.EDITOR]),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

export const articleSchema = z.object({
  title: z.string()
    .min(10, 'Le titre doit contenir au moins 10 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  abstract: z.string()
    .min(100, 'Le résumé doit contenir au moins 100 caractères')
    .max(2000, 'Le résumé ne peut pas dépasser 2000 caractères'),
  content: z.string()
    .min(1000, 'Le contenu doit contenir au moins 1000 caractères'),
  keywords: z.string()
    .min(1, 'Au moins un mot-clé requis'),
  categoryId: z.string()
    .min(1, 'Catégorie requise'),
  language: z.string().default('fr'),
  coAuthorEmails: z.string().optional(),
  ethicsStatement: z.string()
    .min(50, 'La déclaration d\'éthique doit contenir au moins 50 caractères'),
  conflictOfInterest: z.string()
    .min(20, 'La déclaration de conflit d\'intérêts doit contenir au moins 20 caractères'),
  coverLetter: z.string()
    .min(100, 'La lettre d\'accompagnement doit contenir au moins 100 caractères')
})

export const submissionSchema = z.object({
  coverLetter: z.string()
    .min(100, 'La lettre d\'accompagnement doit contenir au moins 100 caractères')
    .max(5000, 'La lettre d\'accompagnement ne peut pas dépasser 5000 caractères'),
  ethicsStatement: z.string()
    .min(50, 'La déclaration d\'éthique doit contenir au moins 50 caractères')
    .max(2000, 'La déclaration d\'éthique ne peut pas dépasser 2000 caractères'),
  conflictOfInterest: z.string()
    .min(20, 'La déclaration de conflit d\'intérêts doit contenir au moins 20 caractères')
    .max(1000, 'La déclaration de conflit d\'intérêts ne peut pas dépasser 1000 caractères')
})

export const reviewSchema = z.object({
  recommendation: z.enum(['ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT'], {
    errorMap: () => ({ message: 'Recommandation requise' })
  }),
  comments: z.string()
    .min(50, 'Les commentaires doivent contenir au moins 50 caractères')
    .max(5000, 'Les commentaires ne peuvent pas dépasser 5000 caractères'),
  confidentialComments: z.string()
    .max(2000, 'Les commentaires confidentiels ne peuvent pas dépasser 2000 caractères')
    .optional(),
  technicalQuality: z.number()
    .min(1, 'La qualité technique doit être entre 1 et 5')
    .max(5, 'La qualité technique doit être entre 1 et 5'),
  novelty: z.number()
    .min(1, 'La nouveauté doit être entre 1 et 5')
    .max(5, 'La nouveauté doit être entre 1 et 5'),
  significance: z.number()
    .min(1, 'La significance doit être entre 1 et 5')
    .max(5, 'La significance doit être entre 1 et 5'),
  clarity: z.number()
    .min(1, 'La clarté doit être entre 1 et 5')
    .max(5, 'La clarté doit être entre 1 et 5'),
  overallScore: z.number()
    .min(1, 'Le score global doit être entre 1 et 5')
    .max(5, 'Le score global doit être entre 1 et 5')
})