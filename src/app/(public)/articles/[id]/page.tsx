import PublicArticlePage from "@/src/components/articles/PublicArticlePage";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/articles/${id}`, { cache: "no-store" });
    const data = await response.json();

    if (data.success && data.article) {
      return {
        title: data.article.title,
        description: data.article.abstract,
      };
    }
  } catch (error) {
    console.error("Error fetching article for metadata:", error);
  }

  return {
    title: "Article",
    description: "Article scientifique",
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicArticlePage articleId={id} />;
}
