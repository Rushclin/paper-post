import React, { ReactNode, HTMLAttributes } from "react";
import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "./../globals.css";
import { siteData } from "@/src/data/app";
import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import { UserRole } from "@prisma/client";

import { twMerge } from "tailwind-merge";
import { MobileBar, Sidebar } from "@/src/components/dashboard/Sidebar";
import DashboardFooter from "@/src/components/dashboard/Footer";
import DashboardHeader from "@/src/components/dashboard/Header";

const manrope = Manrope({ subsets: ["latin"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `Dashboard - ${siteData.metadata.title}`,
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

interface GlobalLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  bodyClassName?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({
  children,
  title,
  subtitle,
  className = "",
  // bodyClassName = "",
  hideHeader = false,
  hideFooter = false,
  ...props
}) => {
  return (
    <html lang="fr">
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased`}
      >
        <div
          className={twMerge(
            "flex h-screen overflow-hidden bg-slate-50 p-0",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </body>
    </html>
  );
};

interface DashboardLayoutProps extends GlobalLayoutProps {
  noFloating?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  noFloating = false,
  className = "",
  bodyClassName = "",
  hideHeader = false,
  hideFooter = false,
  ...props
}) => {

  return (
    <ProtectedRoute
      allowedRoles={[
        UserRole.AUTHOR,
        UserRole.REVIEWER,
        UserRole.EDITOR,
        UserRole.ADMIN,
      ]}
    >
      {/* <GlobalLayout
        title={title}
        subtitle={subtitle}
        className={twMerge(className, "lg:p-3")}
        bodyClassName={bodyClassName}
        hideHeader={hideHeader}
        hideFooter={hideFooter}
        {...props}
      > */}
        <Sidebar className="hidden overflow-auto lg:block" />
        <MobileBar className="bg-white lg:hidden" />
        <div className="flex w-full flex-col overflow-auto rounded-lg bg-slate-100/50 shadow-sm lg:bg-white ">
          <DashboardHeader title={title} subtitle={subtitle} />
          <div
            className={twMerge(
              "h-full px-4 py-4 pb-20 lg:overflow-auto lg:px-7 lg:pb-0",
              bodyClassName
            )}
          >
            {children}
            {!hideFooter && (
              <DashboardFooter className="my-8 mt-20 border-0 pb-32 lg:pb-0" />
            )}
          </div>
        </div>
      {/* </GlobalLayout> */}
    </ProtectedRoute>
  );
};

export default DashboardLayout;
