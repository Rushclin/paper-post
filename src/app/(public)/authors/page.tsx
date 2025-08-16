import { AuthorsList } from "@/src/components/authors/AuthorsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Auteurs - Plateforme Scientifique",
  description: "Découvrez nos auteurs et chercheurs, leurs publications et contributions à la science.",
};

export default function AuthorsPage() {
  return <AuthorsList />;
}