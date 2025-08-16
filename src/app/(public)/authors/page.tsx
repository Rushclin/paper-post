import { Metadata } from "next";
import { AuthorsList } from "@/src/components/authors/AuthorsList";

async function getAuthors() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/public/authors`, {
    cache: "no-store", // ou "force-cache" selon ton besoin
  });
  return await res.json();
}

export async function generateMetadata(): Promise<Metadata> {
  const res = await getAuthors();
  const count = res.authors.length;

  return {
    title: `Nos Auteurs (${count}) - Plateforme Scientifique`,
    description:
      "Découvrez nos auteurs et chercheurs, leurs publications et contributions à la science.",
  };
}

export default async function AuthorsPage() {
  return <AuthorsList />;
}
