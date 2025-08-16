"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState, useMemo } from "react";

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select";
  filterOptions?: string[];
  render?: (value: any, row: T) => React.ReactNode;
}

export interface Filter {
  key: string;
  value: string;
  type: "text" | "select";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchable?: boolean;
  className?: string;
  filterComponent?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  searchable = true,
  className = "",
  filterComponent,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const [filters, setFilters] = useState<Filter[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fonction de tri
  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Données filtrées et triées
  const processedData = useMemo(() => {
    let result = [...data];

    // Recherche globale
    if (globalSearch) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(globalSearch.toLowerCase())
        )
      );
    }

    // Filtres spécifiques
    filters.forEach((filter) => {
      result = result.filter((row) => {
        const value = String(row[filter.key]).toLowerCase();
        return value.includes(filter.value.toLowerCase());
      });
    });

    // Tri
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, globalSearch, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Icône de tri
  const SortIcon = ({ column }: { column: keyof T }) => {
    if (sortConfig.key !== column) {
      return (
        <span className="text-gray-400">
          <ArrowUpDown className="w-3 h-3" />
        </span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <span>
        <ArrowUp className="w-3 h-3 text-slate-500" />
      </span>
    ) : (
      <span>
        <ArrowDown className="w-3 h-3 text-slate-500" />
      </span>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex space-x-2 items-end">
        <input
          placeholder="Rechercher dans toutes les colonnes..."
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-sm text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {globalSearch && (
          <button
            className="border p-2 h-full rounded-md border-blue-500"
            onClick={() => setGlobalSearch("")}
          >
            <Trash2 className="w-5 h-5 text-slate-500" />
          </button>
        )}
        {filterComponent ? filterComponent : null}
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="border-b bg-muted/50 rounded-md">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-muted" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && <SortIcon column={column.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Aucune donnée trouvée
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3">
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
            {Math.min(currentPage * pageSize, processedData.length)} sur{" "}
            {processedData.length} résultats
          </div>
          {/* <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div> */}
        </div>
      )}
    </div>
  );
}
