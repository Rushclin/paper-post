"use client";

import Link from "next/link";
import { Avatar } from "../common/Avatar";
import { ChevronRight, Save, Share2Icon } from "lucide-react";
import { Article } from "@/src/types/articles";
import { formatDate, getAuthorInfo, getAuthorName, truncateText } from "@/src/utils/articleHelpers";

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  affiliation?: string;
  department?: string;
}

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
}

export default function ArticleCard({
  article,
  compact = false,
}: ArticleCardProps) {
  
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
              name={`${getAuthorName(article)}`}
              tagline={getAuthorInfo(article)}
            />

            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {truncateText(article.abstract, 120)}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(article.createdAt)}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {article.category.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article
      key={article.id}
      className="bg-white rounded-md p-6 border border-gray-100 shadow-2xs"
    >
      <div className="flex space-x-6">
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <div className="flex-row md:flex items-start justify-between mb-3">
              <h3 className="text-md font-bold text-gray-900 leading-tight">
                <Link
                  href={`/articles/${article.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {article.title}
                </Link>
              </h3>

              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {article.category.name}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium text-gray-900">
                  {getAuthorName(article)}
                </span>
                {getAuthorInfo(article) && (
                  <span className="block text-xs text-gray-500">
                    {getAuthorInfo(article)}
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
              <span>📅 {formatDate(article.createdAt)}</span>

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

              {article.doi && (
                <>
                  <span>•</span>
                  <Link
                    href={`https://doi.org/${article.doi}`}
                    className="text-blue-600 hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    DOI: {article.doi}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {truncateText(article.abstract, 300)}
            </p>
          </div>

          {(article.keywords || []).length > 0 && (
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

          <div className="flex-row md:flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span>👁️</span>
                <span>{Math.floor(Math.random() * 1000) + 100} vues</span>
              </div>

              <div className="flex items-center space-x-1">
                <span>📊</span>
                <span>{Math.floor(Math.random() * 50)} citations</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 my-2">
              <Link
                href={`/articles/${article.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border"
              >
                Lire l'article
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
