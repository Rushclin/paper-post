
// app/(public)/articles/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate, generateCitation } from '@/src/utils/articleHelpers'

interface PublicArticleDetail {
  id: string
  title: string
  abstract: string
  content: string
  keywords: string[]
  language: string
  doi?: string
  publishedAt: string
  createdAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    title?: string
    affiliation?: string
    department?: string
    bio?: string
    orcid?: string
  }
  category: {
    id: string
    name: string
    slug: string
    description?: string
  }
  coAuthors: {
    id: string
    order: number
    author: {
      id: string
      firstName: string
      lastName: string
      title?: string
      affiliation?: string
      department?: string
      orcid?: string
    }
  }[]
  journal?: {
    id: string
    name: string
    issn?: string
    description?: string
  }
  issue?: {
    id: string
    volume: number
    number: number
    year: number
    title?: string
    description?: string
  }
}

export default function PublicArticlePage() {
  const params = useParams()
  const articleId = params.id as string

  const [article, setArticle] = useState<PublicArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [citationFormat, setCitationFormat] = useState<'apa' | 'mla' | 'chicago'>('apa')

  useEffect(() => {
    fetchArticle()
  }, [articleId])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/public/articles/${articleId}`)
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

  const getAuthorName = (author: any) => {
    return `${author.title ? author.title + ' ' : ''}${author.firstName} ${author.lastName}`
  }

  const getAuthorInfo = (author: any) => {
    const parts = []
    if (author.affiliation) parts.push(author.affiliation)
    if (author.department) parts.push(author.department)
    return parts.join(', ')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.abstract,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papiers!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article non trouvé
          </h1>
          <p className="text-gray-600 mb-8">
            {error || 'Cet article n\'existe pas ou n\'est pas encore publié.'}
          </p>
          <Link 
            href="/articles"
            className="inline-flex items-center px-6 py-3  text-base font-medium rounded-md text-white"
          >
            Voir tous les articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">Accueil</Link>
            <span>›</span>
            <Link href="/articles" className="hover:text-gray-700">Articles</Link>
            <span>›</span>
            <span className="text-gray-900">{article.category.name}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {article.category.name}
              </span>
              <span className="text-sm text-gray-500">
                Publié le {formatDate(article.publishedAt)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Partager"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              
              <button
                onClick={() => window.print()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Imprimer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-sm p-8">
          {/* Titre */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>

            {/* DOI */}
            {article.doi && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>DOI:</strong>{' '}
                  <Link 
                    href={`https://doi.org/${article.doi}`}
                    className="text-green-600 hover:text-green-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.doi}
                  </Link>
                </p>
              </div>
            )}

            {/* Informations de publication */}
            {article.journal && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Publié dans:</strong> {article.journal.name}
                  {article.issue && (
                    <span> - Vol. {article.issue.volume}, No. {article.issue.number} ({article.issue.year})</span>
                  )}
                  {article.journal.issn && (
                    <span> - ISSN: {article.journal.issn}</span>
                  )}
                </p>
              </div>
            )}
          </header>

          {/* Auteurs */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Auteurs</h2>
            
            <div className="space-y-4">
              {/* Auteur principal */}
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {article.author.firstName.charAt(0)}{article.author.lastName.charAt(0)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {getAuthorName(article.author)}
                    <span className="ml-2 text-sm text-blue-600 font-medium">(Auteur principal)</span>
                  </h3>
                  {getAuthorInfo(article.author) && (
                    <p className="text-sm text-gray-600">{getAuthorInfo(article.author)}</p>
                  )}
                  {article.author.orcid && (
                    <p className="text-sm text-gray-500">
                      ORCID: <Link 
                        href={`https://orcid.org/${article.author.orcid}`}
                        className="text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {article.author.orcid}
                      </Link>
                    </p>
                  )}
                  {article.author.bio && (
                    <p className="text-sm text-gray-600 mt-2">{article.author.bio}</p>
                  )}
                </div>
              </div>

              {/* Co-auteurs */}
              {article.coAuthors.map((coAuthor) => (
                <div key={coAuthor.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                      {coAuthor.author.firstName.charAt(0)}{coAuthor.author.lastName.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {getAuthorName(coAuthor.author)}
                    </h3>
                    {getAuthorInfo(coAuthor.author) && (
                      <p className="text-sm text-gray-600">{getAuthorInfo(coAuthor.author)}</p>
                    )}
                    {coAuthor.author.orcid && (
                      <p className="text-sm text-gray-500">
                        ORCID: <Link 
                          href={`https://orcid.org/${coAuthor.author.orcid}`}
                          className="text-blue-600 hover:text-blue-800"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {coAuthor.author.orcid}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Résumé */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-justify">
                {article.abstract}
              </p>
            </div>
          </section>

          {/* Mots-clés */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mots-clés</h2>
            <div className="flex flex-wrap gap-2">
              {(article.keywords || []).map((keyword, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>

          {/* Contenu */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Article complet</h2>
            <div className="prose max-w-none">
              {/* <div className="text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">
                {article.content}
              </div> */}
              <div className="prose prose-lg max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {article.content} 
      </ReactMarkdown>
    </div>
            </div>
          </section>

          {/* Citation */}
          <section className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Citation</h2>
              <select
                value={citationFormat}
                onChange={(e) => setCitationFormat(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="apa">APA</option>
                <option value="mla">MLA</option>
                <option value="chicago">Chicago</option>
              </select>
            </div>
            <div className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-700 font-mono">
                {generateCitation(article, citationFormat)}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateCitation(article, citationFormat))
                  alert('Citation copiée!')
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Copier la citation
              </button>
            </div>
          </section>
        </article>

        {/* Articles similaires */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles similaires</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Articles similaires bientôt disponibles...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
