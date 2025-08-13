// app/(dashboard)/publications/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ArticleForm from '@/src/components/articles/ArticleForm'

interface Article {
  id: string
  title: string
  abstract: string
  content: string
  keywords: string[]
  language: string
  categoryId: string
  coAuthors: {
    author: {
      email: string
    }
  }[]
}

function EditArticleContent() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Erreur lors du chargement de l\'article')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any, isDraft: boolean) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        router.push('/dashboard/publications')
      } else {
        return { success: false, message: result.message, errors: result.errors }
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' }
    }

    return { success: true }
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

  const initialData = {
    title: article.title,
    abstract: article.abstract,
    content: article.content,
    keywords: article.keywords.join(', '),
    categoryId: article.categoryId,
    language: article.language,
    coAuthorEmails: article.coAuthors.map(ca => ca.author.email).join(', '),
    ethicsStatement: '',
    conflictOfInterest: '',
    coverLetter: ''
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Modifier l'article</h1>
        <p className="text-gray-600">Apportez des modifications à votre publication</p>
      </div>

      <ArticleForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        isEditing={true}
      />
    </div>
  )
}

export default function EditArticlePage() {
  return (
      <EditArticleContent />
  )
}