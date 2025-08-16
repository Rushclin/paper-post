"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  MapPin, 
  Building2, 
  ExternalLink, 
  BookOpen, 
  Eye, 
  Quote, 
  TrendingUp,
  Calendar,
  Users,
  Award
} from "lucide-react";
import { formatDate } from "@/src/utils/articleHelpers";

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
}

interface Article {
  id: string;
  title: string;
  abstract: string;
  publishedAt: string;
  category: {
    name: string;
    slug: string;
  };
  _count: {
    views: number;
    citations: number;
  };
}

interface AuthorStats {
  totalArticles: number;
  totalViews: number;
  totalCitations: number;
  hIndex: number;
  categoriesStats: Array<{
    category: { name: string; slug: string };
    articleCount: number;
  }>;
  monthlyViews: Array<{ month: string; views: number }>;
  monthlyCitations: Array<{ month: string; citations: number }>;
  topCollaborators: Array<{
    author: {
      id: string;
      firstName: string;
      lastName: string;
      affiliation?: string;
    };
    collaborationCount: number;
  }>;
}

interface PublicAuthorProfileProps {
  authorId: string;
}

export function PublicAuthorProfile({ authorId }: PublicAuthorProfileProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAuthorData();
  }, [authorId]);

  const fetchAuthorData = async () => {
    try {
      const response = await fetch(`/api/public/authors/${authorId}`);
      const data = await response.json();

      if (data.success) {
        setAuthor(data.author);
        setArticles(data.articles);
        setStats(data.stats);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const getFullName = () => {
    if (!author) return "";
    const title = author.title ? `${author.title} ` : "";
    return `${title}${author.firstName} ${author.lastName}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Auteur non trouvé
          </h1>
          <p className="text-gray-600 mb-8">
            {error || "Cet auteur n'existe pas ou n'est pas accessible."}
          </p>
          <Link
            href="/authors"
            className="inline-flex items-center px-6 py-3 text-base font-medium border rounded-full hover:bg-gray-50"
          >
            Voir tous les auteurs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header du profil */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Avatar et infos principales */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-blue-600" />
              </div>
            </div>

            <div className="mt-6 lg:mt-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {getFullName()}
              </h1>
              
              <div className="mt-4 space-y-2">
                {author.affiliation && (
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-5 h-5 mr-2" />
                    <span>{author.affiliation}</span>
                  </div>
                )}
                
                {author.department && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{author.department}</span>
                  </div>
                )}
                
                {author.orcid && (
                  <div className="flex items-center text-gray-600">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    <a 
                      href={`https://orcid.org/${author.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ORCID: {author.orcid}
                    </a>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Membre depuis {formatDate(author.createdAt)}</span>
                </div>
              </div>

              {author.bio && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Biographie
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {author.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Statistiques en sidebar */}
            <div className="mt-8 lg:mt-0 lg:w-80">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Statistiques
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.totalArticles || 0}
                    </div>
                    <div className="text-sm text-gray-600">Articles</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.totalViews || 0}
                    </div>
                    <div className="text-sm text-gray-600">Vues</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.totalCitations || 0}
                    </div>
                    <div className="text-sm text-gray-600">Citations</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats?.hIndex || 0}
                    </div>
                    <div className="text-sm text-gray-600">H-Index</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Vue d'ensemble", icon: TrendingUp },
              { id: "articles", name: "Articles", icon: BookOpen },
              { id: "collaborations", name: "Collaborations", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Catégories d'articles */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Répartition par catégorie
              </h3>
              <div className="space-y-3">
                {stats?.categoriesStats.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{cat.category.name}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {cat.articleCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Évolution mensuelle */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Activité récente
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Vues mensuelles
                  </h4>
                  <div className="h-20 bg-gray-50 rounded flex items-end justify-between px-2">
                    {stats?.monthlyViews.slice(-6).map((month, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 rounded-t"
                        style={{
                          height: `${Math.max((month.views / Math.max(...stats.monthlyViews.map(m => m.views))) * 60, 4)}px`,
                          width: "20px"
                        }}
                        title={`${month.month}: ${month.views} vues`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Citations mensuelles
                  </h4>
                  <div className="h-20 bg-gray-50 rounded flex items-end justify-between px-2">
                    {stats?.monthlyCitations.slice(-6).map((month, index) => (
                      <div
                        key={index}
                        className="bg-purple-500 rounded-t"
                        style={{
                          height: `${Math.max((month.citations / Math.max(...stats.monthlyCitations.map(m => m.citations))) * 60, 4)}px`,
                          width: "20px"
                        }}
                        title={`${month.month}: ${month.citations} citations`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "articles" && (
          <div className="space-y-6">
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun article publié
                </h3>
                <p className="text-gray-600">
                  Cet auteur n'a pas encore d'articles publiés.
                </p>
              </div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link
                        href={`/articles/${article.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {article.title}
                      </Link>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {article.category.name}
                        </span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {article.abstract}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {article._count.views} vues
                      </div>
                      <div className="flex items-center">
                        <Quote className="w-4 h-4 mr-1" />
                        {article._count.citations} citations
                      </div>
                    </div>
                    
                    <Link
                      href={`/articles/${article.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Lire l'article →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "collaborations" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Principaux collaborateurs
              </h3>
              
              {stats?.topCollaborators.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Aucune collaboration trouvée
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.topCollaborators.map((collab, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <Link
                            href={`/authors/${collab.author.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {collab.author.firstName} {collab.author.lastName}
                          </Link>
                          {collab.author.affiliation && (
                            <p className="text-sm text-gray-500">
                              {collab.author.affiliation}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {collab.collaborationCount}
                        </div>
                        <div className="text-sm text-gray-500">
                          collaboration{collab.collaborationCount > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}