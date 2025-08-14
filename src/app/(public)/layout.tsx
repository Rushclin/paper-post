import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "./../globals.css";
import { siteData } from "../../data/app";
import Header from "../../components/public/Header";
import Footer from "../../components/public/Footer";

const manrope = Manrope({ subsets: ["latin"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteData.metadata.title,
  description: siteData.metadata.description,
  openGraph: {
    title: siteData.metadata.title,
    description: siteData.metadata.description,
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 675,
        alt: siteData.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteData.metadata.title,
    description: siteData.metadata.description,
    images: ["/images/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
