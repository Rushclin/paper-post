// app/(dashboard)/publications/drafts/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserRole } from "@prisma/client";

function DraftsPageContent() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/articles?status=DRAFT", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setDrafts(data.articles);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes brouillons</h1>
          <p className="text-gray-600">Articles en cours de rédaction</p>
        </div>
        <Link
          href="/dashboard/publications/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nouveau brouillon
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun brouillon
          </h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore de brouillons en cours.
          </p>
          <Link
            href="/dashboard/publications/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Créer un nouveau brouillon
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft: any) => (
            <div
              key={draft.id}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 truncate">
                  {draft.title || "Sans titre"}
                </h3>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  Brouillon
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {draft.abstract || "Aucun résumé"}
              </p>

              <div className="text-xs text-gray-500 mb-4">
                Modifié le{" "}
                {new Date(draft.updatedAt).toLocaleDateString("fr-FR")}
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/publications/${draft.id}/edit`}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700 transition-colors"
                >
                  Continuer
                </Link>
                <Link
                  href={`/dashboard/publications/${draft.id}`}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  Voir
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DraftsPage() {
  return <DraftsPageContent />;
}
