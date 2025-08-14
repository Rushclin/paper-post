// components/public/ArticleCard.tsx - Composant réutilisable pour les cards d'articles
"use client";

import Link from "next/link";
import { Avatar } from "../common/Avatar";

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  affiliation?: string;
  department?: string;
}

interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  publishedAt: string;
  doi?: string;
  author: Author;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  coAuthors: {
    id: string;
    order: number;
    author: Author;
  }[];
  journal?: {
    id: string;
    name: string;
    issn?: string;
  };
  issue?: {
    id: string;
    volume: number;
    number: number;
    year: number;
  };
  _count: {
    reviews: number;
  };
}

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
}

export default function ArticleCard({
  article,
  compact = false,
}: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const getAuthorName = (author: Author) => {
    return `${author.title ? author.title + " " : ""}${author.firstName} ${
      author.lastName
    }`;
  };

  const getAuthorInfo = (author: Author) => {
    const parts = [];
    if (author.affiliation) parts.push(author.affiliation);
    if (author.department) parts.push(author.department);
    return parts.join(", ");
  };

  if (compact) {
    return (
      <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 p-4 border border-gray-100">
        <div className="flex items-start space-x-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              <Link
                href={`/articles/${article.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {truncateText(article.title, 80)}
              </Link>
            </h3>
            <Avatar
              name={`${getAuthorName(article.author)}`}
              tagline={getAuthorInfo(article.author)}
            />

            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {truncateText(article.abstract, 120)}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(article.publishedAt)}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {article.category.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Version complète (celle utilisée dans LatestArticles)
  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      {/* Contenu identique à celui dans LatestArticles */}
      <div className="flex space-x-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {article.author.firstName.charAt(0)}
            {article.author.lastName.charAt(0)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                <Link
                  href={`/articles/${article.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {article.title}
                </Link>
              </h3>

              <div className="flex-shrink-0 ml-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {article.category.name}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium text-gray-900">
                  {getAuthorName(article.author)}
                </span>
                {getAuthorInfo(article.author) && (
                  <span className="block text-xs text-gray-500">
                    {getAuthorInfo(article.author)}
                  </span>
                )}
              </div>

              {article.coAuthors.length > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <div>
                    <span className="text-gray-600">
                      {article.coAuthors.length === 1
                        ? `+1 co-auteur`
                        : `+${article.coAuthors.length} co-auteurs`}
                    </span>
                    <div className="text-xs text-gray-500">
                      {article.coAuthors
                        .slice(0, 2)
                        .map(
                          (ca) => ca.author.firstName + " " + ca.author.lastName
                        )
                        .join(", ")}
                      {article.coAuthors.length > 2 && ", ..."}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span>📅 {formatDate(article.publishedAt)}</span>

              {article.journal && (
                <>
                  <span>•</span>
                  <span>📖 {article.journal.name}</span>
                </>
              )}

              {article.issue && (
                <>
                  <span>•</span>
                  <span>
                    Vol. {article.issue.volume}, No. {article.issue.number} (
                    {article.issue.year})
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {truncateText(article.abstract, 300)}
            </p>
          </div>

          {article.keywords.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {article.keywords.slice(0, 5).map((keyword, keyIndex) => (
                  <span
                    key={keyIndex}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {keyword}
                  </span>
                ))}
                {article.keywords.length > 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    +{article.keywords.length - 5} autres
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span>👁️</span>
                <span>{Math.floor(Math.random() * 1000) + 100} vues</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💬</span>
                <span>{article._count.reviews} évaluations</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📊</span>
                <span>{Math.floor(Math.random() * 50)} citations</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-blue-600 transition-colors">
                <span className="sr-only">Sauvegarder</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>

              <button className="text-gray-500 hover:text-green-600 transition-colors">
                <span className="sr-only">Partager</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>

              <Link
                href={`/articles/${article.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Lire l'article
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
