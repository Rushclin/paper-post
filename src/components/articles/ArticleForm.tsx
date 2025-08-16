// components/articles/ArticleForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArticleFormData } from "@/src/types/articles";
import { LaTeXEditor } from "@/src/components/common/LaTeXEditor";


interface ArticleFormProps {
  initialData?: Partial<ArticleFormData>;
  onSubmit: (
    data: ArticleFormData,
    isDraft: boolean
  ) => Promise<{ success: boolean; message?: string; errors?: any }>;
  isEditing?: boolean;
}

export default function ArticleForm({
  initialData,
  onSubmit,
  isEditing = false,
}: ArticleFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    abstract: "",
    content: "",
    keywords: "",
    categoryId: "",
    language: "fr",
    coAuthorEmails: "",
    ethicsStatement: "",
    conflictOfInterest: "",
    coverLetter: "",
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleInputChange = (field: keyof ArticleFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    setErrors({});

    const result = await onSubmit(formData, isDraft);

    if (!result.success) {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        alert(result.message || "Une erreur est survenue");
      }
    }

    setLoading(false);
  };

  const steps = [
    {
      id: 1,
      name: "Informations générales",
      description: "Titre, résumé et contenu",
    },
    {
      id: 2,
      name: "Détails et collaborateurs",
      description: "Catégorie, mots-clés et co-auteurs",
    },
    {
      id: 3,
      name: "Soumission",
      description: "Déclarations et lettre d'accompagnement",
    },
  ];

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.title.length >= 10 &&
          formData.abstract.length >= 100 &&
          formData.content.length >= 1000
        );
      case 2:
        return formData.categoryId && formData.keywords.trim().length > 0;
      case 3:
        return (
          formData.ethicsStatement.length >= 50 &&
          formData.conflictOfInterest.length >= 20
        );
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation des étapes */}
      <div className="bg-white border rounded-md p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li
                key={step.id}
                className={`relative ${
                  stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    {step.id < currentStep ? (
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    ) : step.id === currentStep ? (
                      <div className="h-8 w-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-semibold">
                          {step.id}
                        </span>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                        <span className="text-gray-500 text-sm">{step.id}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        step.id <= currentStep
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Formulaire */}
      <div className="bg-white border rounded-md p-6">
        {/* Étape 1: Informations générales */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Informations générales
            </h2>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Titre de l'article *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Titre complet et descriptif de votre article"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.title.length}/200 caractères (minimum 10)
              </p>
            </div>

            <div>
              <label
                htmlFor="abstract"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Résumé *
              </label>
              <LaTeXEditor
                value={formData.abstract}
                onChange={(value) => handleInputChange("abstract", value || "")}
                height={200}
                placeholder="Rédigez le résumé de votre article ici...\n\nVous pouvez utiliser du **Markdown** et des équations $\\LaTeX$ comme $E = mc^2$"
              />
              {errors.abstract && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.abstract[0]}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.abstract.length}/2000 caractères (minimum 100)
              </p>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contenu de l'article *
              </label>
              
              
              <LaTeXEditor
                value={formData.content}
                onChange={(value) => handleInputChange("content", value || "")}
                height={500}
                placeholder="# Titre de votre article\n\n## Introduction\n\nRédigez le contenu de votre article ici...\n\n**Formatage supporté:**\n- Markdown standard\n- Équations LaTeX: $\\sum_{i=1}^n x_i$\n- Blocs d'équations:\n\n$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$\n\n## Méthodologie\n\n## Résultats\n\n## Conclusion"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content[0]}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.content.length} caractères (minimum 1000)
              </p>
            </div>
          </div>
        )}

        {/* Étape 2: Détails et collaborateurs */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Détails et collaborateurs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Catégorie *
                </label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.categoryId[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Langue
                </label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mots-clés *
              </label>
              <input
                type="text"
                id="keywords"
                value={formData.keywords}
                onChange={(e) => handleInputChange("keywords", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="intelligence artificielle, machine learning, algorithmes (séparés par des virgules)"
              />
              {errors.keywords && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.keywords[0]}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Séparez les mots-clés par des virgules (minimum 1 requis)
              </p>
            </div>

            <div>
              <label
                htmlFor="coAuthorEmails"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Co-auteurs (optionnel)
              </label>
              <input
                type="text"
                id="coAuthorEmails"
                value={formData.coAuthorEmails}
                onChange={(e) =>
                  handleInputChange("coAuthorEmails", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="email1@example.com, email2@example.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Emails des co-auteurs séparés par des virgules. Ils doivent
                avoir un compte sur la plateforme.
              </p>
            </div>
          </div>
        )}

        {/* Étape 3: Soumission */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Déclarations et soumission
            </h2>

            <div>
              <label
                htmlFor="ethicsStatement"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Déclaration d'éthique *
              </label>
              <textarea
                id="ethicsStatement"
                rows={4}
                value={formData.ethicsStatement}
                onChange={(e) =>
                  handleInputChange("ethicsStatement", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez les considérations éthiques de votre recherche, l'approbation des comités d'éthique, le consentement des participants, etc."
              />
              {errors.ethicsStatement && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ethicsStatement[0]}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.ethicsStatement.length} caractères (minimum 50)
              </p>
            </div>

            <div>
              <label
                htmlFor="conflictOfInterest"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Déclaration de conflit d'intérêts *
              </label>
              <textarea
                id="conflictOfInterest"
                rows={3}
                value={formData.conflictOfInterest}
                onChange={(e) =>
                  handleInputChange("conflictOfInterest", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Déclarez tout conflit d'intérêts potentiel ou indiquez 'Aucun conflit d'intérêts à déclarer'"
              />
              {errors.conflictOfInterest && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.conflictOfInterest[0]}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.conflictOfInterest.length} caractères (minimum 20)
              </p>
            </div>

            <div>
              <label
                htmlFor="coverLetter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Lettre d'accompagnement *
              </label>
              <textarea
                id="coverLetter"
                rows={6}
                value={formData.coverLetter}
                onChange={(e) =>
                  handleInputChange("coverLetter", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Expliquez pourquoi votre article mérite d'être publié dans cette revue, sa contribution originale au domaine, et toute information pertinente pour les éditeurs."
              />
              {errors.coverLetter && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.coverLetter[0]}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.coverLetter.length} caractères (minimum 100)
              </p>
            </div>
          </div>
        )}

        {/* Navigation des étapes */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Précédent
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {/* Bouton Sauvegarder en brouillon */}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder en brouillon"}
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid(currentStep)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading || !isStepValid(3)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Soumission..."
                  : isEditing
                  ? "Mettre à jour"
                  : "Soumettre pour publication"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bouton Annuler */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => router.push("/dashboard/publications")}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
