"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  BookOpen,
  Eye,
  Quote,
  Search,
  Filter,
  ChevronDown,
  Award,
  Loader2,
} from "lucide-react";
import { Avatar } from "../common/Avatar";

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  affiliation?: string;
  department?: string;
  bio?: string;
  orcid?: string;
  createdAt: string;
  stats: {
    totalArticles: number;
    totalViews: number;
    totalCitations: number;
    hIndex: number;
  };
}

const getFullName = (author: Author) => {
  const title = author.title ? `${author.title} ` : "";
  return `${title}${author.firstName} ${author.lastName}`;
};

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function AuthorsList() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAuthors();
  }, [pagination.page, searchTerm, sortBy, sortDirection]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        sortBy,
        sortDirection,
      });

      const response = await fetch(`/api/public/authors?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAuthors(data.authors);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white shadow-sm mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 recoleta">Nos auteurs</h1>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez les chercheurs et leurs contributions à la science
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, affiliation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filtres
                <ChevronDown
                  className={`w-4 h-4 ml-2 transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </form>

            {showFilters && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trier par
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSort(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="lastName">Nom de famille</option>
                      <option value="firstName">Prénom</option>
                      <option value="affiliation">Affiliation</option>
                      <option value="createdAt">Date d'inscription</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordre
                    </label>
                    <select
                      value={sortDirection}
                      onChange={(e) =>
                        setSortDirection(e.target.value as "asc" | "desc")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="asc">Croissant</option>
                      <option value="desc">Décroissant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Articles par page
                    </label>
                    <select
                      value={pagination.limit}
                      onChange={(e) =>
                        setPagination((prev) => ({
                          ...prev,
                          limit: parseInt(e.target.value),
                          page: 1,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4 recoleta">
              Statistiques de la plateforme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {pagination.total}
                </div>
                <div className="text-sm text-gray-600">Auteurs actifs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {authors.reduce(
                    (sum, author) => sum + author.stats.totalArticles,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Articles publiés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {authors.reduce(
                    (sum, author) => sum + author.stats.totalCitations,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Citations totales</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-slate-500" />
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun auteur trouvé
            </h3>
            <p className="text-gray-600">
              Aucun auteur ne correspond à vos critères de recherche.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {authors.map((author) => (
                <div key={author.id}>
                  <AuthorCard author={author} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {(pagination.page - 1) * pagination.limit + 1} à{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  sur {pagination.total} auteurs
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(pagination.pages - 4, pagination.page - 2)
                        ) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: pageNum,
                            }))
                          }
                          className={`px-3 py-2 border rounded-md text-sm font-medium ${
                            pagination.page === pageNum
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(pagination.pages, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="border-b border-b-slate-300 px-6 py-4 flex items-center gap-4">
        <Avatar
          name={getFullName(author)}
          tagline={author.affiliation}
          href={`/authors/${author.id}`}
        />
      </div>

      <div className="flex-1 px-6 py-4">
        {author.bio && (
          <p className="text-gray-700 text-sm mb-6 line-clamp-3">
            {author.bio}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Stat
            icon={<BookOpen className="w-4 h-4 mr-1" />}
            value={author.stats.totalArticles}
            label="Articles"
            color="text-blue-600"
          />
          <Stat
            icon={<Eye className="w-4 h-4 mr-1" />}
            value={author.stats.totalViews}
            label="Vues"
            color="text-green-600"
          />
          <Stat
            icon={<Quote className="w-4 h-4 mr-1" />}
            value={author.stats.totalCitations}
            label="Citations"
            color="text-purple-600"
          />
          <Stat
            icon={<Award className="w-4 h-4 mr-1" />}
            value={author.stats.hIndex}
            label="H-Index"
            color="text-orange-600"
          />
        </div>
      </div>

      <div className="border-t border-t-slate-400 px-6 py-4">
        <Link
          href={`/authors/${author.id}`}
          className="w-full inline-flex items-center justify-center px-4 py-2 border rounded-full text-sm"
        >
          Voir le profil
        </Link>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center ${color} mb-1`}>
        {icon}
        <span className="font-semibold">{value}</span>
      </div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
