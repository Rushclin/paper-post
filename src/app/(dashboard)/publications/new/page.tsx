// app/(dashboard)/publications/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import ArticleForm from "@/src/components/articles/ArticleForm";

function NewArticleContent() {
  const router = useRouter();

  const handleSubmit = async (data: any, isDraft: boolean) => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          submit: !isDraft,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        router.push("/publications");
      } else {
        return {
          success: false,
          message: result.message,
          errors: result.errors,
        };
      }
    } catch (error) {
      return { success: false, message: "Erreur de connexion" };
    }

    return { success: true };
  };

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-state-700">
          Nouvelle publication
        </h1>
        <p className="text-gray-600">
          Créez un nouvel article scientifique pour publication
        </p>
      </div>

      <ArticleForm onSubmit={handleSubmit} />
    </div>
  );
}

export default function NewArticlePage() {
  return <NewArticleContent />;
}
