// components/public/LatestArticles.tsx
"use client";

import { usePublicArticles } from "@/src/hooks/usePublicArticles";
import { usePublicStats } from "@/src/hooks/usePublicStats";
import Link from "next/link";
import { Avatar } from "../common/Avatar";

const LatestArticles: React.FC = () => {
  const { articles, loading, error } = usePublicArticles({ limit: 5 });
  const { stats } = usePublicStats();

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

  const getAuthorName = (author: any) => {
    return `${author.title ? author.title + " " : ""}${author.firstName} ${
      author.lastName
    }`;
  };

  const getAuthorInfo = (author: any) => {
    const parts = [];
    if (author.affiliation) parts.push(author.affiliation);
    if (author.department) parts.push(author.department);
    return parts.join(", ");
  };

  if (error) {
    return (
      <section id="latest-articles" className="py-20 px-5 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">
              Une erreur est survenue lors du chargement des articles.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="latest-articles" className="py-20 px-5 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header avec statistiques */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Dernières Publications
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Découvrez les recherches les plus récentes publiées dans notre revue
          </p>

          <div className="flex justify-center items-center space-x-8 text-lg">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-blue-600">
                {stats.totalArticles}
              </span>
              <span className="text-gray-600">articles publiés</span>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-green-600">
                {stats.totalAuthors}
              </span>
              <span className="text-gray-600">auteurs</span>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-purple-600">
                {stats.recentArticles}
              </span>
              <span className="text-gray-600">ce mois-ci</span>
            </div>
          </div>
        </div>

        {/* Liste des articles */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 animate-pulse"
              >
                <div className="flex space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Aucun article publié
            </h3>
            <p className="text-gray-600">
              Les premiers articles seront bientôt disponibles.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article, index) => (
              <article
                key={article.id}
                className="bg-white rounded-md p-6 border border-gray-100 shadow-2xs"
              >
                <div className="flex space-x-6">
                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    <div className="pb-4">
                      <Avatar
                        name={`${article.author.title} ${article.author.firstName} ${article.author.lastName}`}
                        tagline={article.author.affiliation}
                      />
                    </div>
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

                      {/* Informations sur les auteurs */}
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
                                    (ca) =>
                                      ca.author.firstName +
                                      " " +
                                      ca.author.lastName
                                  )
                                  .join(", ")}
                                {article.coAuthors.length > 2 && ", ..."}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Métadonnées de publication */}
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
                              Vol. {article.issue.volume}, No.{" "}
                              {article.issue.number} ({article.issue.year})
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

                    {/* Abstract */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {truncateText(article.abstract, 300)}
                      </p>
                    </div>

                    {/* Mots-clés */}
                    {(article.keywords || []).length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {article.keywords
                            .slice(0, 5)
                            .map((keyword, keyIndex) => (
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

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>👁️</span>
                          <span>
                            {Math.floor(Math.random() * 1000) + 100} vues
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>💬</span>
                          <span>{article._count.reviews} évaluations</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>📊</span>
                          <span>
                            {Math.floor(Math.random() * 50)} citations
                          </span>
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
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border"
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
            ))}
          </div>
        )}

        {/* Call to action */}
        <div className="text-center mt-16">
          <Link
            href="/articles"
            className="inline-flex items-center px-8 py-3 text-base font-medium rounded-full border hover:shadow-md transition-all"
          >
            Voir tous les articles
            <svg
              className="ml-2 w-5 h-5"
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
    </section>
  );
};

export default LatestArticles;
