"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Filter, X } from "lucide-react";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  searchable?: boolean;
}

interface FilterOption {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: Array<{ value: string; label: string }>; // Pour les selects
  placeholder?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface DataTableProps<T extends { id: string }> {
  endpoint: string;
  columns: Column<T>[];
  pageSize?: number;
  emptyMessage?: string;
  filters?: FilterOption[];
  searchPlaceholder?: string;
  title?: string;
}

interface ApiResponse<T> {
  success: boolean;
  [key: string]: any;
  data?: T[];
  pagination?: Pagination;
}

export function DataTable<T extends { id: string }>({
  endpoint,
  columns,
  pageSize = 10,
  emptyMessage = "Aucun élément trouvé",
  filters = [],
  searchPlaceholder = "Rechercher...",
  title,
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: pageSize,
    total: 0,
    pages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  const token = localStorage.getItem("auth-token");

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", pageSize.toString());

      // Ajouter les paramètres de recherche
      if (searchTerm) {
        params.set("search", searchTerm);
      }

      // Ajouter les filtres actifs
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      // Ajouter le tri
      if (sortConfig) {
        params.set("sortBy", sortConfig.key.toString());
        params.set("sortDirection", sortConfig.direction);
      }

      const response = await fetch(`/api/${endpoint}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json: ApiResponse<T> = await response.json();
      if (json.success) {
        setData(json[endpoint] || json.data || []);
        setPagination(
          json.pagination || {
            page,
            limit: pageSize,
            total: json.data?.length || 0,
            pages: 1,
          }
        );
      } else {
        setError("Erreur lors du chargement des données");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.page);
  }, [pagination.page, searchTerm, activeFilters, sortConfig]);

  // Debounce pour la recherche
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchData(1);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSort = (key: keyof T) => {
    const column = columns.find((col) => col.accessor === key);
    if (!column?.sortable) return;

    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilter = (filterKey: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
    setSortConfig(null);
  };

  const getSortIcon = (key: keyof T) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {/* Bouton filtres */}
            {filters.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                  showFilters || Object.keys(activeFilters).length > 0
                    ? "border-blue-500 text-blue-700 bg-blue-50"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {Object.keys(activeFilters).length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {Object.keys(activeFilters).length}
                  </span>
                )}
              </button>
            )}

            {/* Bouton reset */}
            {(searchTerm ||
              Object.keys(activeFilters).length > 0 ||
              sortConfig) && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Section des filtres */}
        {showFilters && filters.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  {filter.type === "select" ? (
                    <select
                      value={activeFilters[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Tous</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={filter.type}
                      placeholder={filter.placeholder}
                      value={activeFilters[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  )}
                  {activeFilters[filter.key] && (
                    <button
                      onClick={() => clearFilter(filter.key)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.accessor && handleSort(col.accessor)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  } ${col.className || ""}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {col.accessor && getSortIcon(col.accessor) && (
                      <span className="text-blue-500">
                        {getSortIcon(col.accessor)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!data ||
              (data.length === 0 && (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {emptyMessage}
                  </h3>
                </div>
              ))}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center text-red-700">
                {error}
              </div>
            )}

            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={`px-6 py-4 whitespace-nowrap ${
                      col.className || ""
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : col.accessor
                      ? (item[col.accessor] as any)
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Affichage de{" "}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            à{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            sur <span className="font-medium">{pagination.total}</span>{" "}
            résultats
          </p>
          <div className="space-x-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium ${
                    page === pagination.page
                      ? "bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
