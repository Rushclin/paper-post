// app/(dashboard)/publications/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArticleStatus } from "@prisma/client";

interface ArticleDetail {
  id: string;
  title: string;
  abstract: string;
  content: string;
  keywords: string[];
  language: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  doi?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    affiliation?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  coAuthors: {
    id: string;
    order: number;
    isCorresponding: boolean;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      title?: string;
      affiliation?: string;
    };
  }[];
  submissions: {
    id: string;
    status: string;
    submittedAt: string;
    coverLetter?: string;
    ethicsStatement?: string;
    conflictOfInterest?: string;
    reviews: {
      id: string;
      recommendation: string;
      overallScore: number;
      isCompleted: boolean;
      submittedAt?: string;
      reviewer: {
        firstName: string;
        lastName: string;
      };
    }[];
  }[];
  journal?: {
    id: string;
    name: string;
  };
  issue?: {
    id: string;
    volume: number;
    number: number;
    year: number;
  };
}

function ArticleDetailContent() {
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setArticle(data.article);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Erreur lors du chargement de l'article");
      console.error(error)
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ArticleStatus) => {
    const statusConfig = {
      DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
      SUBMITTED: { label: "Soumis", color: "bg-blue-100 text-blue-800" },
      UNDER_REVIEW: {
        label: "En évaluation",
        color: "bg-yellow-100 text-yellow-800",
      },
      REVISION_REQUIRED: {
        label: "Révision requise",
        color: "bg-orange-100 text-orange-800",
      },
      ACCEPTED: { label: "Accepté", color: "bg-green-100 text-green-800" },
      REJECTED: { label: "Rejeté", color: "bg-red-100 text-red-800" },
      PUBLISHED: { label: "Publié", color: "bg-purple-100 text-purple-800" },
      WITHDRAWN: { label: "Retiré", color: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getRecommendationBadge = (recommendation: string) => {
    const config = {
      ACCEPT: { label: "Accepter", color: "bg-green-100 text-green-800" },
      MINOR_REVISION: {
        label: "Révision mineure",
        color: "bg-blue-100 text-blue-800",
      },
      MAJOR_REVISION: {
        label: "Révision majeure",
        color: "bg-orange-100 text-orange-800",
      },
      REJECT: { label: "Rejeter", color: "bg-red-100 text-red-800" },
    };

    const configItem = config[recommendation as keyof typeof config];
    if (!configItem) return null;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${configItem.color}`}
      >
        {configItem.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
          <div className="mt-4">
            <Link
              href="/publications"
              className="text-red-600 hover:text-red-500 font-medium"
            >
              ← Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">Article non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/publications"
          className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
        >
          ← Retour à mes publications
        </Link>

        <div className="flex space-x-3">
          {["DRAFT", "REVISION_REQUIRED"].includes(article.status) && (
            <>
              <Link
                href={`/publications/${article.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modifier
              </Link>
              <Link
                href={`/publications/${article.id}/submit`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Soumettre
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Informations principales */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {article.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Catégorie: {article.category.name}</span>
              <span>•</span>
              <span>Langue: {article.language.toUpperCase()}</span>
              <span>•</span>
              <span>
                Créé le{" "}
                {new Date(article.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
          <div>{getStatusBadge(article.status)}</div>
        </div>

        {/* DOI si publié */}
        {article.doi && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              <strong>DOI:</strong> {article.doi}
            </p>
          </div>
        )}

        {/* Dates importantes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Dernière modification
            </h4>
            <p className="text-sm text-gray-900">
              {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          {article.submittedAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                Date de soumission
              </h4>
              <p className="text-sm text-gray-900">
                {new Date(article.submittedAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          )}
          {article.publishedAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                Date de publication
              </h4>
              <p className="text-sm text-gray-900">
                {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          )}
        </div>

        {/* Mots-clés */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Mots-clés</h3>
          <div className="flex flex-wrap gap-2">
            {(article.keywords|| []).map((keyword, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Auteurs */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Auteurs</h2>

        <div className="space-y-3">
          {/* Auteur principal */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                {article.author.title} {article.author.firstName}{" "}
                {article.author.lastName}
                <span className="ml-2 text-sm text-blue-600 font-medium">
                  (Auteur principal)
                </span>
              </p>
              <p className="text-sm text-gray-600">{article.author.email}</p>
              {article.author.affiliation && (
                <p className="text-sm text-gray-600">
                  {article.author.affiliation}
                </p>
              )}
            </div>
          </div>

          {/* Co-auteurs */}
          {article.coAuthors.map((coAuthor) => (
            <div
              key={coAuthor.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {coAuthor.author.title} {coAuthor.author.firstName}{" "}
                  {coAuthor.author.lastName}
                  {coAuthor.isCorresponding && (
                    <span className="ml-2 text-sm text-purple-600 font-medium">
                      (Correspondant)
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">{coAuthor.author.email}</p>
                {coAuthor.author.affiliation && (
                  <p className="text-sm text-gray-600">
                    {coAuthor.author.affiliation}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                Ordre: {coAuthor.order}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {article.abstract}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenu</h2>
        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </div>
      </div>

      {/* Soumissions et Reviews */}
      {article.submissions.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Historique des soumissions
          </h2>

          <div className="space-y-4">
            {article.submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    Soumission du{" "}
                    {new Date(submission.submittedAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      submission.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : submission.status === "REVIEWING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {submission.status === "COMPLETED"
                      ? "Terminé"
                      : submission.status === "REVIEWING"
                      ? "En cours"
                      : "En attente"}
                  </span>
                </div>

                {/* Reviews */}
                {submission.reviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Évaluations
                    </h4>
                    <div className="space-y-2">
                      {submission.reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Reviewer: {review.reviewer.firstName}{" "}
                                {review.reviewer.lastName}
                              </p>
                              {review.submittedAt && (
                                <p className="text-xs text-gray-500">
                                  Soumis le{" "}
                                  {new Date(
                                    review.submittedAt
                                  ).toLocaleDateString("fr-FR")}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {getRecommendationBadge(review.recommendation)}
                              <p className="text-xs text-gray-500 mt-1">
                                Score: {review.overallScore}/5
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations de publication */}
      {article.journal && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Publication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Journal</h4>
              <p className="text-gray-900">{article.journal.name}</p>
            </div>
            {article.issue && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Numéro</h4>
                <p className="text-gray-900">
                  Vol. {article.issue.volume}, No. {article.issue.number} (
                  {article.issue.year})
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArticleDetailPage() {
  return <ArticleDetailContent />;
}
