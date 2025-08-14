"use"
import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "./../globals.css";
import { siteData } from "@/src/data/app";
import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import { UserRole } from "@prisma/client";
import { useState } from "react";
// import { usePathname } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import Link from "next/link";

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


function DashboardContent() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Tableau de bord
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mes articles</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📄
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+2 ce mois</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En cours de review</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              ⏳
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Moyenne: 4 semaines</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Publiés</p>
              <p className="text-3xl font-bold text-gray-900">8</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">Taux: 67%</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Citations</p>
              <p className="text-3xl font-bold text-gray-900">142</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              📊
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+18 ce mois</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Articles récents
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Intelligence Artificielle et Éthique</h3>
                <p className="text-sm text-gray-600">Soumis le 15 Nov 2024</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                En review
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Machine Learning Explicable</h3>
                <p className="text-sm text-gray-600">Publié le 2 Nov 2024</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Publié
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📝</span>
                <div>
                  <h3 className="font-medium text-gray-900">Nouvel article</h3>
                  <p className="text-sm text-gray-600">Commencer un nouveau manuscrit</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <h3 className="font-medium text-gray-900">Collaborations</h3>
                  <p className="text-sm text-gray-600">Gérer vos co-auteurs</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h3 className="font-medium text-gray-900">Statistiques</h3>
                  <p className="text-sm text-gray-600">Voir vos métriques</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // const [sidebarOpen, setSidebarOpen] = useState(false)
  // const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  // const pathname = usePathname()
  // const { user, logout } = useAuth()

  // // Navigation items
  // const navigation = [
  //   {
  //     name: 'Tableau de bord',
  //     href: '/dashboard',
  //     icon: '📊',
  //     current: pathname === '/dashboard'
  //   },
  //   {
  //     name: 'Publications',
  //     icon: '📝',
  //     children: [
  //       {
  //         name: 'Mes publications',
  //         href: '/dashboard/publications',
  //         icon: '📄',
  //         current: pathname === '/dashboard/publications'
  //       },
  //       {
  //         name: 'Nouvelle publication',
  //         href: '/dashboard/publications/new',
  //         icon: '➕',
  //         current: pathname === '/dashboard/publications/new'
  //       },
  //       {
  //         name: 'Brouillons',
  //         href: '/dashboard/publications/drafts',
  //         icon: '📝',
  //         current: pathname === '/dashboard/publications/drafts'
  //       }
  //     ]
  //   },
  //   {
  //     name: 'Reviews',
  //     href: '/dashboard/reviews',
  //     icon: '🔍',
  //     current: pathname.startsWith('/dashboard/reviews'),
  //     badge: '3' // Nombre de reviews en attente
  //   },
  //   {
  //     name: 'Collaborations',
  //     href: '/dashboard/collaborations',
  //     icon: '👥',
  //     current: pathname === '/dashboard/collaborations'
  //   },
  //   {
  //     name: 'Statistiques',
  //     href: '/dashboard/statistics',
  //     icon: '📈',
  //     current: pathname === '/dashboard/statistics'
  //   }
  // ]

  // const handleLogout = async () => {
  //   await logout()
  // }


  return (
    <html lang="fr">
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased`}
      >
        {/* <ProtectedRoute
          allowedRoles={[
            UserRole.AUTHOR,
            UserRole.REVIEWER,
            UserRole.EDITOR,
            UserRole.ADMIN,
          ]}
        >
<DashboardContent/>
          {children}
        </ProtectedRoute> */}




        <div className="min-h-screen bg-gray-50">
      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <SidebarContent navigation={navigation} />
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <SidebarContent navigation={navigation} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Left side - Mobile menu button */}
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Page title */}
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {getPageTitle(pathname)}
                  </h1>
                </div>
              </div>

              {/* Right side - Profile dropdown */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <span className="sr-only">Notifications</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 00-12 0v3L0 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Badge de notification */}
                  <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role?.toLowerCase()}
                      </p>
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <span className="mr-3">👤</span>
                          Mon profil
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <span className="mr-3">⚙️</span>
                          Paramètres
                        </Link>
                        <Link
                          href="/dashboard/help"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <span className="mr-3">❓</span>
                          Aide
                        </Link>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <span className="mr-3">🚪</span>
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
      </body>
    </html>
  );
}


function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/dashboard/publications': 'Mes publications',
    '/dashboard/publications/new': 'Nouvelle publication',
    '/dashboard/publications/drafts': 'Brouillons',
    '/dashboard/reviews': 'Reviews',
    '/dashboard/collaborations': 'Collaborations',
    '/dashboard/statistics': 'Statistiques',
    '/dashboard/profile': 'Mon profil',
    '/dashboard/settings': 'Paramètres',
    '/dashboard/help': 'Aide'
  }

  return titles[pathname] || 'Dashboard'
}

function SidebarContent({ navigation }: { navigation: any[] }) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Publications'])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📚</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Revue Sci</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              // Navigation item with children
              <div>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group"
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </div>
                  <svg
                    className={`h-4 w-4 transform transition-transform ${
                      expandedItems.includes(item.name) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Sub-navigation */}
                {expandedItems.includes(item.name) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child: any) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          child.current
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span className="mr-3 text-base">{child.icon}</span>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Simple navigation item
              <Link
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="h-2 w-2 bg-white rounded-full"></span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">En ligne</p>
            <p className="text-xs text-gray-500">Système opérationnel</p>
          </div>
        </div>
      </div>
    </>
  )
}