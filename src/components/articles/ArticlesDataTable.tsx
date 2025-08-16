"use client";

import { DataTable } from "@/src/components/common/Datatable";
import { Article } from "@/src/types/articles";
import { formatDate } from "@/src/utils/articleHelpers";
import Link from "next/link";
import { Eye, Quote, Edit, Trash } from "lucide-react";

interface ArticlesDataTableProps {
  authToken?: string;
  showActions?: boolean;
  endpoint?: string;
}

export function ArticlesDataTable({ 
  authToken, 
  showActions = false,
  endpoint = "articles"
}: ArticlesDataTableProps) {
  
  const columns = [
    {
      header: "Titre",
      accessor: "title" as keyof Article,
      sortable: true,
      searchable: true,
      render: (article: Article) => (
        <div className="max-w-xs">
          <Link 
            href={`/articles/${article.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium line-clamp-2"
          >
            {article.title}
          </Link>
        </div>
      ),
    },
    {
      header: "Auteur",
      accessor: "author" as keyof Article,
      sortable: true,
      render: (article: Article) => (
        <div>
          <div className="font-medium text-gray-900">
            {article.author.firstName} {article.author.lastName}
          </div>
          {article.author.affiliation && (
            <div className="text-sm text-gray-500">{article.author.affiliation}</div>
          )}
        </div>
      ),
    },
    {
      header: "Catégorie",
      accessor: "category" as keyof Article,
      sortable: true,
      render: (article: Article) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {article.category.name}
        </span>
      ),
    },
    {
      header: "Statut",
      accessor: "status" as keyof Article,
      sortable: true,
      render: (article: Article) => {
        const statusColors = {
          DRAFT: "bg-gray-100 text-gray-800",
          SUBMITTED: "bg-yellow-100 text-yellow-800",
          UNDER_REVIEW: "bg-blue-100 text-blue-800",
          REVISION_REQUIRED: "bg-orange-100 text-orange-800",
          ACCEPTED: "bg-green-100 text-green-800",
          REJECTED: "bg-red-100 text-red-800",
          PUBLISHED: "bg-purple-100 text-purple-800",
          WITHDRAWN: "bg-gray-100 text-gray-800",
        };
        
        const statusLabels = {
          DRAFT: "Brouillon",
          SUBMITTED: "Soumis",
          UNDER_REVIEW: "En révision",
          REVISION_REQUIRED: "Révision requise",
          ACCEPTED: "Accepté",
          REJECTED: "Rejeté",
          PUBLISHED: "Publié",
          WITHDRAWN: "Retiré",
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[article.status] || statusColors.DRAFT}`}>
            {statusLabels[article.status] || article.status}
          </span>
        );
      },
    },
    {
      header: "Métriques",
      render: (article: Article) => (
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {(article as any)._count?.views || 0}
          </div>
          <div className="flex items-center">
            <Quote className="w-4 h-4 mr-1" />
            {(article as any)._count?.citations || 0}
          </div>
        </div>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt" as keyof Article,
      sortable: true,
      render: (article: Article) => (
        <div className="text-sm text-gray-900">
          {formatDate(article.createdAt)}
        </div>
      ),
    },
  ];

  // Ajouter la colonne d'actions si nécessaire
  if (showActions) {
    columns.push({
      header: "Actions",
      render: (article: Article) => (
        <div className="flex items-center space-x-2">
          <Link
            href={`/articles/${article.id}`}
            className="text-blue-600 hover:text-blue-900"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/articles/${article.id}/edit`}
            className="text-gray-600 hover:text-gray-900"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            className="text-red-600 hover:text-red-900"
            title="Supprimer"
            onClick={() => {
              // TODO: Implémenter la suppression
              console.log("Supprimer article:", article.id);
            }}
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
    });
  }

  const filters = [
    {
      key: "status",
      label: "Statut",
      type: "select" as const,
      options: [
        { value: "DRAFT", label: "Brouillon" },
        { value: "SUBMITTED", label: "Soumis" },
        { value: "UNDER_REVIEW", label: "En révision" },
        { value: "REVISION_REQUIRED", label: "Révision requise" },
        { value: "ACCEPTED", label: "Accepté" },
        { value: "REJECTED", label: "Rejeté" },
        { value: "PUBLISHED", label: "Publié" },
        { value: "WITHDRAWN", label: "Retiré" },
      ],
    },
    {
      key: "categoryId",
      label: "Catégorie",
      type: "select" as const,
      options: [
        // TODO: Charger dynamiquement les catégories
        { value: "1", label: "Sciences" },
        { value: "2", label: "Technologie" },
        { value: "3", label: "Médecine" },
      ],
    },
    {
      key: "authorId",
      label: "Auteur",
      type: "text" as const,
      placeholder: "Nom de l'auteur...",
    },
    {
      key: "createdFrom",
      label: "Date de création (depuis)",
      type: "date" as const,
    },
    {
      key: "createdTo",
      label: "Date de création (jusqu'à)",
      type: "date" as const,
    },
  ];

  return (
    <DataTable<Article>
      endpoint={endpoint}
      columns={columns}
      filters={filters}
      searchPlaceholder="Rechercher des articles..."
      title="Articles"
      authToken={authToken}
      emptyMessage="Aucun article trouvé"
      pageSize={10}
    />
  );
}