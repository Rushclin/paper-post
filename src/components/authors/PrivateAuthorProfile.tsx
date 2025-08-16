"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Lock,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  ExternalLink,
  Calendar,
  BookOpen,
  Quote,
  TrendingUp,
  Award
} from "lucide-react";

interface Author {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  affiliation?: string;
  department?: string;
  bio?: string;
  orcid?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthorStats {
  totalArticles: number;
  totalViews: number;
  totalCitations: number;
  hIndex: number;
}

export function PrivateAuthorProfile() {
  const [author, setAuthor] = useState<Author | null>(null);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    affiliation: "",
    department: "",
    bio: "",
    orcid: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setAuthor(data.user);
        setEditForm({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          title: data.user.title || "",
          affiliation: data.user.affiliation || "",
          department: data.user.department || "",
          bio: data.user.bio || "",
          orcid: data.user.orcid || "",
        });
        
        // Fetch stats (simplified - you may want to use the same API as public profile)
        setStats({
          totalArticles: 0, // Would be fetched from API
          totalViews: 0,
          totalCitations: 0,
          hIndex: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/auth/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        setAuthor(data.user);
        setIsEditing(false);
        setSuccessMessage("Profil mis à jour avec succès!");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      setErrors({ general: "Erreur lors de la mise à jour du profil" });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: "Les mots de passe ne correspondent pas" });
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowPasswordForm(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false,
        });
        setSuccessMessage("Mot de passe modifié avec succès!");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrors({ password: data.message });
      }
    } catch (error) {
      setErrors({ password: "Erreur lors de la modification du mot de passe" });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    if (author) {
      setEditForm({
        firstName: author.firstName || "",
        lastName: author.lastName || "",
        title: author.title || "",
        affiliation: author.affiliation || "",
        department: author.department || "",
        bio: author.bio || "",
        orcid: author.orcid || "",
      });
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

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600">
            Impossible de charger votre profil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-green-800">{successMessage}</div>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{errors.general}</div>
          </div>
        )}

        {/* Header avec statistiques */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              {/* Avatar et infos principales */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              <div className="mt-4 lg:mt-0 flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Mon Profil
                  </h1>
                  <div className="flex items-center space-x-2">
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </button>
                    )}
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Mot de passe
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations du profil */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Informations personnelles
              </h2>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {getFullName()}
                      </div>
                      <div className="text-sm text-gray-500">{author.email}</div>
                    </div>
                  </div>

                  {author.affiliation && (
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-gray-900">{author.affiliation}</div>
                        {author.department && (
                          <div className="text-sm text-gray-500">{author.department}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {author.orcid && (
                    <div className="flex items-center">
                      <ExternalLink className="w-5 h-5 text-gray-400 mr-3" />
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

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-gray-900">
                      Membre depuis {new Date(author.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  {author.bio && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Biographie
                      </h3>
                      <p className="text-gray-900 leading-relaxed">
                        {author.bio}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Dr., Prof., etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Affiliation
                    </label>
                    <input
                      type="text"
                      value={editForm.affiliation}
                      onChange={(e) => setEditForm({ ...editForm, affiliation: e.target.value })}
                      placeholder="Université, Institut, Entreprise"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Département
                    </label>
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      placeholder="Département, Laboratoire"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ORCID
                    </label>
                    <input
                      type="text"
                      value={editForm.orcid}
                      onChange={(e) => setEditForm({ ...editForm, orcid: e.target.value })}
                      placeholder="0000-0000-0000-0000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biographie
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={4}
                      placeholder="Parlez-nous de votre parcours, vos domaines de recherche..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Modification du mot de passe */}
          {showPasswordForm && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Modifier le mot de passe
                </h2>

                {errors.password && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="text-red-800 text-sm">{errors.password}</div>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel *
                    </label>
                    <div className="relative">
                      <input
                        type={passwordForm.showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordForm({ ...passwordForm, showCurrentPassword: !passwordForm.showCurrentPassword })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {passwordForm.showCurrentPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={passwordForm.showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordForm({ ...passwordForm, showNewPassword: !passwordForm.showNewPassword })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {passwordForm.showNewPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum 8 caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={passwordForm.showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.confirmPassword ? "border-red-300" : "border-gray-300"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordForm({ ...passwordForm, showConfirmPassword: !passwordForm.showConfirmPassword })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {passwordForm.showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Modifier le mot de passe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}