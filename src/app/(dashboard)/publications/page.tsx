// app/(dashboard)/publications/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArticleStatus } from "@prisma/client";
import { Eye, Loader2, Plus } from "lucide-react";
import { Article } from "@/src/types/articles";
import { DataTable } from "@/src/components/common/Datatable";
import { formatDate } from "@/src/utils/articleHelpers";

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
      console.error(error);
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
      console.error(error);
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

    buttons.push(
      <Link
        key="view"
        href={`/publications/${article.id}`}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
      >
        <Eye className="w-4 h-4" />
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
        <Loader2 className="animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <DataTable<Article>
        data={articles}
        columns={[
          {
            key: "title",
            header: "Titre",
            render: (_, a) => (
              <div className="max-w-xs">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {a.title.substring(0, 100)}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {a.abstract.substring(0, 100)}...
                </div>
              </div>
            ),
          },
          {
            key: "coAuthors",
            header: "Co auteur-s",
            render: (_, a) => (
              <div className="text-sm text-gray-900">
                {a.coAuthors.length === 0 ? (
                  <span className="text-gray-500">Aucun</span>
                ) : (
                  <div>
                    {a.coAuthors.slice(0, 2).map((coAuthor) => (
                      <div key={coAuthor.id} className="text-xs">
                        {coAuthor.author.firstName} {coAuthor.author.lastName}
                      </div>
                    ))}
                    {a.coAuthors.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{a.coAuthors.length - 2} autres
                      </div>
                    )}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "status",
            header: "Statut",
            render: (_, a) => getStatusBadge(a.status),
          },
          {
            key: "category",
            header: "Catégorie",
            render: (_, a) => a.category.name,
          },
          {
            key: "updatedAt",
            header: "Modifié",
            render: (_, a) => formatDate(a.createdAt),
          },
          {
            key: "id",
            header: "Actions",
            render: (_, row) => (
              <div className="flex items-center gap-2 text-right">
                {getActionButtons(row)}
              </div>
            ),
          },
        ]}
        filterComponent={
          <>
            <div className="flex gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="max-w-sm text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="max-w-sm text-sm  px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          </>
        }
      />
    </div>
  );
}

export default function ArticlesListPage() {
  return <ArticlesListContent />;
}
