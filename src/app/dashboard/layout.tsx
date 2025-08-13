import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
// import "./globals.css";
import { siteDate } from "@/src/data/app";
import Header from "@/src/components/public/Header";

const manrope = Manrope({ subsets: ["latin"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `Dashboard - ${siteDate.metadata.title}`,
  description: siteDate.metadata.description,
  openGraph: {
    title: siteDate.metadata.title,
    description: siteDate.metadata.description,
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 675,
        alt: siteDate.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteDate.metadata.title,
    description: siteDate.metadata.description,
    images: ["/images/twitter-image.jpg"],
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased`}
      >
        <Header/>
        <Header/>
        {children}
      </body>
    </html>
  );
}
