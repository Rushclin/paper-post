import { siteDate } from "../data/app";
import { AuthProvider } from "../hooks/useAuth";
import "./globals.css";

export const metadata = {
  title: siteDate.siteName,
  description: siteDate.metadata.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
