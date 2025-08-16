import { PublicAuthorProfile } from "@/src/components/authors/PublicAuthorProfile";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/authors/${id}`, { cache: "no-store" });
    const data = await response.json();

    if (data.success && data.author) {
      const fullName = `${data.author.title ? data.author.title + " " : ""}${data.author.firstName} ${data.author.lastName}`;
      return {
        title: `${fullName} - Profil Auteur`,
        description: data.author.bio || `Découvrez le profil de ${fullName}, ses publications et contributions scientifiques.`,
      };
    }
  } catch (error) {
    console.error("Error fetching author for metadata:", error);
  }

  return {
    title: "Profil Auteur",
    description: "Profil d'un auteur scientifique",
  };
}

export default async function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicAuthorProfile authorId={id} />;
}