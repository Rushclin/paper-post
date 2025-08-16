'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RegisterFormData, AuthResponse } from '@/src/types/auth'
import { USER_ROLES, ACADEMIC_TITLES } from '@/src/types/auth'
import { useCategories } from '@/src/hooks/useCategories'
import { useRegisterValidation } from '@/src/hooks/useAuthValidation'
import toast from 'react-hot-toast'

export default function RegisterForm() {
  const {categories} = useCategories();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    title: '',
    affiliation: '',
    department: '',
    bio: '',
    orcid: '',
    researchInterests: [],
    role: USER_ROLES.AUTHOR,
    acceptTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [success, setSuccess] = useState(false)
  const { validateField, validateAll, hasError, getError, isValid } = useRegisterValidation()
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({})
  // Validation en temps réel quand les champs changent
  useEffect(() => {
    if (Object.keys(formTouched).length > 0) {
      validateAll(formData)
    }
  }, [formData, validateAll, formTouched])

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean | string[]) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    setFormTouched({ ...formTouched, [field]: true })
    
    // Validation en temps réel avec toutes les données pour les règles inter-champs
    validateField(field, value, newFormData)
    
    // Si on modifie le password, re-valider confirmPassword s'il est touché
    if (field === 'password' && formTouched.confirmPassword) {
      validateField('confirmPassword', newFormData.confirmPassword, newFormData)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valider le formulaire complet
    const validation = validateAll(formData)
    if (!validation.isValid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      const allFieldsTouched = Object.keys(formData).reduce((acc, field) => {
        acc[field] = true
        return acc
      }, {} as Record<string, boolean>)
      setFormTouched(allFieldsTouched)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data: AuthResponse = await response.json()

      if (data.success) {
        setSuccess(true)
        toast.success("Votre compte a été crée")
      } else {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: [data.message] })
        }
      }
    } catch (error) {
      setErrors({ general: ['Erreur de connexion. Veuillez réessayer.'] })
    } finally {
      setLoading(false)
    }
  }

  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.researchInterests.includes(interest)
      ? formData.researchInterests.filter(i => i !== interest)
      : [...formData.researchInterests, interest]
    
    setFormData({ ...formData, researchInterests: newInterests })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center bg-green-100 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Inscription réussie !
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Un email de vérification a été envoyé à votre adresse email.
              Veuillez vérifier votre boîte mail et cliquer sur le lien pour activer votre compte.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Aller à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-blue-100 rounded-full">
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Rejoignez notre plateforme de publication scientifique
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  {errors.general.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                    hasError('firstName') && formTouched.firstName
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {hasError('firstName') && formTouched.firstName && (
                  <p className="mt-1 text-sm text-red-600">{getError('firstName')}</p>
                )}
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                    hasError('lastName') && formTouched.lastName
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {hasError('lastName') && formTouched.lastName && (
                  <p className="mt-1 text-sm text-red-600">{getError('lastName')}</p>
                )}
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre académique
                </label>
                <select
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Sélectionner un titre</option>
                  {ACADEMIC_TITLES.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="orcid" className="block text-sm font-medium text-gray-700">
                  ORCID ID
                </label>
                <input
                  id="orcid"
                  type="text"
                  placeholder="0000-0000-0000-0000"
                  value={formData.orcid}
                  onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.orcid && (
                  <p className="mt-1 text-sm text-red-600">{errors.orcid[0]}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                  hasError('email') && formTouched.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {hasError('email') && formTouched.email && (
                <p className="mt-1 text-sm text-red-600">{getError('email')}</p>
              )}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>
          </div>

          {/* Mot de passe */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sécurité</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                    hasError('password') && formTouched.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {hasError('password') && formTouched.password && (
                  <p className="mt-1 text-sm text-red-600">{getError('password')}</p>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                    hasError('confirmPassword') && formTouched.confirmPassword
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {hasError('confirmPassword') && formTouched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{getError('confirmPassword')}</p>
                )}
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword[0]}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations académiques</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">
                  Affiliation (Institution/Université)
                </label>
                <input
                  id="affiliation"
                  type="text"
                  value={formData.affiliation}
                  onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.affiliation && (
                  <p className="mt-1 text-sm text-red-600">{errors.affiliation[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Département
                </label>
                <input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Biographie
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Décrivez brièvement votre parcours et vos recherches"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rôle principal *
                </label>
                <select
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={USER_ROLES.AUTHOR}>Auteur</option>
                  <option value={USER_ROLES.REVIEWER}>Reviewer</option>
                  <option value={USER_ROLES.EDITOR}>Éditeur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domaines de recherche * (sélectionnez au moins un)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map(interest => (
                    <label key={interest.id} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.researchInterests.includes(interest.name)}
                        onChange={() => handleInterestToggle(interest.name)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">{interest.name}</span>
                    </label>
                  ))}
                </div>
                {errors.researchInterests && (
                  <p className="mt-1 text-sm text-red-600">{errors.researchInterests[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                J'accepte les{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  politique de confidentialité
                </Link>
                {' '}*
              </label>
            </div>
            {hasError('acceptTerms') && formTouched.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{getError('acceptTerms')}</p>
            )}
            {errors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.acceptTerms[0]}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isValid || !formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.acceptTerms}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
