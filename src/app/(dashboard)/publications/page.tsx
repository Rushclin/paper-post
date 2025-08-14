// app/(dashboard)/publications/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArticleStatus } from "@prisma/client";
import { Plus } from "lucide-react";

interface Article {
  id: string;
  title: string;
  abstract: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  keywords: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  coAuthors: {
    id: string;
    order: number;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
  _count: {
    reviews: number;
    submissions: number;
  };
}

interface ArticlesResponse {
  success: boolean;
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function ArticlesListContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
  });

  const [categories, setCategories] = useState<any[]>([]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Charger les articles
  useEffect(() => {
    fetchArticles();
  }, [searchParams]);

  const fetchArticles = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", searchParams.get("page") || "1");
      params.set("limit", "10");

      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);

      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/articles?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ArticlesResponse = await response.json();

      if (data.success) {
        setArticles(data.articles);
        setPagination(data.pagination);
      } else {
        setError("Erreur lors du chargement des articles");
      }
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    params.set("page", "1"); // Reset to first page

    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.category) params.set("category", newFilters.category);

    router.push(`/publications?${params.toString()}`);
  };

  const handleDeleteArticle = async (
    articleId: string,
    articleTitle: string
  ) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'article "${articleTitle}" ?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setArticles(articles.filter((a) => a.id !== articleId));
        alert("Article supprimé avec succès");
      } else {
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur de connexion");
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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getActionButtons = (article: Article) => {
    const buttons = [];

    // Voir l'article
    buttons.push(
      <Link
        key="view"
        href={`/publications/${article.id}`}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
      >
        Voir
      </Link>
    );

    // Modifier (seulement brouillons et révisions requises)
    if (["DRAFT", "REVISION_REQUIRED"].includes(article.status)) {
      buttons.push(
        <Link
          key="edit"
          href={`/publications/${article.id}/edit`}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          Modifier
        </Link>
      );
    }

    // Supprimer (seulement brouillons)
    if (article.status === "DRAFT") {
      buttons.push(
        <button
          key="delete"
          onClick={() => handleDeleteArticle(article.id, article.title)}
          className="text-red-600 hover:text-red-900 text-sm font-medium"
        >
          Supprimer
        </button>
      );
    }

    // Soumettre (brouillons et révisions)
    if (["DRAFT", "REVISION_REQUIRED"].includes(article.status)) {
      buttons.push(
        <Link
          key="submit"
          href={`/publications/${article.id}/submit`}
          className="text-green-600 hover:text-green-900 text-sm font-medium"
        >
          Soumettre
        </Link>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes publications</h1>
          <p className="text-gray-600">
            Gérez vos articles et publications scientifiques
          </p>
        </div>
        <Link
          href="/publications/new"
          className="px-4 py-2 rounded-full border transition-colors flex items-center text-base"
        >
          <Plus className="w-4 h-4 mr-3" />
          Nouvelle publication
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Titre, résumé, mots-clés..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="DRAFT">Brouillons</option>
              <option value="SUBMITTED">Soumis</option>
              <option value="UNDER_REVIEW">En évaluation</option>
              <option value="REVISION_REQUIRED">Révision requise</option>
              <option value="ACCEPTED">Acceptés</option>
              <option value="PUBLISHED">Publiés</option>
              <option value="REJECTED">Rejetés</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Liste des articles */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun article trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre première publication scientifique.
          </p>
          <Link
            href="/publications/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <span className="mr-2">➕</span>
            Créer ma première publication
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Co-auteurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modifié
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {article.abstract.substring(0, 100)}...
                        </div>
                        {(article.keywords || []).length > 0 && (
                          <div className="mt-1">
                            {article.keywords
                              .slice(0, 3)
                              .map((keyword, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                                >
                                  {keyword}
                                </span>
                              ))}
                            {article.keywords.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{article.keywords.length - 3} autres
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {article.coAuthors.length === 0 ? (
                          <span className="text-gray-500">Aucun</span>
                        ) : (
                          <div>
                            {article.coAuthors.slice(0, 2).map((coAuthor) => (
                              <div key={coAuthor.id} className="text-xs">
                                {coAuthor.author.firstName}{" "}
                                {coAuthor.author.lastName}
                              </div>
                            ))}
                            {article.coAuthors.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{article.coAuthors.length - 2} autres
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex space-x-2 justify-end">
                        {getActionButtons(article).map((button, index) => (
                          <span key={index}>{button}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  {pagination.page > 1 && (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(
                          searchParams.toString()
                        );
                        params.set("page", (pagination.page - 1).toString());
                        router.push(`/publications?${params.toString()}`);
                      }}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                  )}
                  {pagination.page < pagination.pages && (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(
                          searchParams.toString()
                        );
                        params.set("page", (pagination.page + 1).toString());
                        router.push(`/publications?${params.toString()}`);
                      }}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  )}
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de{" "}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{" "}
                      à{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      sur{" "}
                      <span className="font-medium">{pagination.total}</span>{" "}
                      résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {/* Pages de pagination */}
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === pagination.pages ||
                            Math.abs(page - pagination.page) <= 2
                        )
                        .map((page, index, array) => {
                          const showEllipsis =
                            index > 0 && array[index - 1] !== page - 1;
                          return (
                            <div key={page}>
                              {showEllipsis && (
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams(
                                    searchParams.toString()
                                  );
                                  params.set("page", page.toString());
                                  router.push(
                                    `/publications?${params.toString()}`
                                  );
                                }}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === pagination.page
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ArticlesListPage() {
  return <ArticlesListContent />;
}
