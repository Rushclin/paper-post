"use client";

import ArticlePagination from "@/src/components/articles/ArticlePagination";
import ArticleCard from "@/src/components/public/ArticleCard";
import { useCategories } from "@/src/hooks/useCategories";
import { usePublicArticles } from "@/src/hooks/usePublicArticles";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function PublicArticlesPage() {
  const [filters, setFilters] = useState({ search: "", category: "" });
  const { articles, loading, pagination, updateFilters } = usePublicArticles({
    limit: 12,
  });
  const { categories } = useCategories();

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 recoleta">
            Articles scientif iques
          </h1>
          <p className="text-xl text-gray-600">
            Explorez notre collection de recherches publiées
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Rechercher
              </label>
              <input
                name="text"
                type="text"
                placeholder="Titre, résumé, mots-clés..."
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange({ ...filters, search: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  handleFilterChange({ ...filters, category: e.target.value })
                }
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

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-slate-500" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Aucun article trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {articles.map((article, index) => (
                <div key={index}>
                  <ArticleCard article={article} key={article.id} />
                </div>
              ))}
            </div>

            <ArticlePagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
