// app/(dashboard)/publications/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@prisma/client'
import ArticleForm from '@/src/components/articles/ArticleForm'

function NewArticleContent() {
  const router = useRouter()

  const handleSubmit = async (data: any, isDraft: boolean) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          submit: !isDraft
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        router.push('/publications')
      } else {
        return { success: false, message: result.message, errors: result.errors }
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' }
    }

    return { success: true }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle publication</h1>
        <p className="text-gray-600">Créez un nouvel article scientifique pour publication</p>
      </div>

      <ArticleForm onSubmit={handleSubmit} />
    </div>
  )
}

export default function NewArticlePage() {
  return (
      <NewArticleContent />
  )
}

