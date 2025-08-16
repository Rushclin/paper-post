import { PrivateAuthorProfile } from "@/src/components/authors/PrivateAuthorProfile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon Profil - Tableau de bord",
  description: "Gérez votre profil d'auteur, vos informations personnelles et vos paramètres.",
};

export default function ProfilePage() {
  return <PrivateAuthorProfile />;
}