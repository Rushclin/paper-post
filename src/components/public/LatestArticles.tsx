"use client";

import { usePublicArticles } from "@/src/hooks/usePublicArticles";
import { usePublicStats } from "@/src/hooks/usePublicStats";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import ArticleCard from "./ArticleCard";

const LatestArticles: React.FC = () => {
  const { articles, loading, error } = usePublicArticles({ limit: 5 });
  const { stats } = usePublicStats();

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
    <section id="latest-articles" className="py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 recoleta">
            Dernieres publications
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Découvrez les recherches les plus récentes publiées dans notre revue
          </p>

          <div className="flex justify-center items-center space-x-8 text-lg">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-blue-600 recoleta">
                {stats.totalArticles}
              </span>
              <span className="text-gray-600">article(s) publiés</span>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-green-600 recoleta">
                {stats.totalAuthors}
              </span>
              <span className="text-gray-600">auteur(s)</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <LoaderCircle className="animate-spin text-slate-400" />
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
          <div className="space-y-2">
            {articles.map((article, index) => (
              <div key={index}>
                <ArticleCard article={article} key={article.id} />
              </div>
            ))}
          </div>
        )}

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
