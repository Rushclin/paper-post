// app/(auth)/verify-email/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de vérification manquant')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage('Email vérifié avec succès ! Vous pouvez maintenant vous connecter.')
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.message || 'Erreur lors de la vérification')
        }
      } catch (error) {
        console.error(error);
        setStatus('error')
        setMessage('Erreur de connexion')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center bg-blue-100 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Vérification en cours...
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Email vérifié !
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <p className="mt-4 text-sm text-gray-500">
                Redirection automatique vers la page de connexion...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center bg-red-100 rounded-full">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Erreur de vérification
              </h2>
              <p className="mt-2 text-sm text-red-600">{message}</p>
              <div className="mt-6 space-y-4">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Aller à la connexion
                </Link>
                <Link
                  href="/register"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Créer un nouveau compte
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}