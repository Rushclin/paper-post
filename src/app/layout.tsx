import { ToastProvider } from "../components/common/ToastContainer";
import { siteData } from "../data/app";
import { AuthProvider } from "../hooks/useAuth";
import "./globals.css";

export const metadata = {
  title: siteData.siteName,
  description: siteData.metadata.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
