// hooks/useAuth.ts
'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthUser, LoginSession } from '@/src/types/auth'

interface AuthContextType extends LoginSession {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth-token')
      if (token) {
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setUser({
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                role: data.user.role,
                isVerified: data.user.isVerified
              })
            } else {
              localStorage.removeItem('auth-token')
            }
          } else {
            localStorage.removeItem('auth-token')
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          localStorage.removeItem('auth-token')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe?: boolean): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, rememberMe })
      })

      const data = await response.json()

      if (data.success && data.user && data.token) {
        setUser(data.user)
        localStorage.setItem('auth-token', data.token)
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('auth-token')
      router.push('/login')
    }
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('auth-token')
    if (!token) return

    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: data.user.role,
            isVerified: data.user.isVerified
          })
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}








// // app/(dashboard)/dashboard/page.tsx
// import ProtectedRoute from '@/components/auth/ProtectedRoute'
// import { UserRole } from '@prisma/client'

// function DashboardContent() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-gray-900 mb-8">
//         Tableau de bord
//       </h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-6 border">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Mes articles</p>
//               <p className="text-3xl font-bold text-gray-900">12</p>
//             </div>
//             <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               📄
//             </div>
//           </div>
//           <p className="text-sm text-green-600 mt-2">+2 ce mois</p>
//         </div>
        
//         <div className="bg-white rounded-xl shadow-sm p-6 border">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">En cours de review</p>
//               <p className="text-3xl font-bold text-gray-900">3</p>
//             </div>
//             <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//               ⏳
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 mt-2">Moyenne: 4 semaines</p>
//         </div>
        
//         <div className="bg-white rounded-xl shadow-sm p-6 border">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Publiés</p>
//               <p className="text-3xl font-bold text-gray-900">8</p>
//             </div>
//             <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
//               ✅
//             </div>
//           </div>
//           <p className="text-sm text-green-600 mt-2">Taux: 67%</p>
//         </div>
        
//         <div className="bg-white rounded-xl shadow-sm p-6 border">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Citations</p>
//               <p className="text-3xl font-bold text-gray-900">142</p>
//             </div>
//             <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
//               📊
//             </div>
//           </div>
//           <p className="text-sm text-green-600 mt-2">+18 ce mois</p>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6 border">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">
//             Articles récents
//           </h2>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div>
//                 <h3 className="font-medium text-gray-900">Intelligence Artificielle et Éthique</h3>
//                 <p className="text-sm text-gray-600">Soumis le 15 Nov 2024</p>
//               </div>
//               <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
//                 En review
//               </span>
//             </div>
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div>
//                 <h3 className="font-medium text-gray-900">Machine Learning Explicable</h3>
//                 <p className="text-sm text-gray-600">Publié le 2 Nov 2024</p>
//               </div>
//               <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
//                 Publié
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-xl shadow-sm p-6 border">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">
//             Actions rapides
//           </h2>
//           <div className="space-y-3">
//             <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
//               <div className="flex items-center">
//                 <span className="text-2xl mr-3">📝</span>
//                 <div>
//                   <h3 className="font-medium text-gray-900">Nouvel article</h3>
//                   <p className="text-sm text-gray-600">Commencer un nouveau manuscrit</p>
//                 </div>
//               </div>
//             </button>
//             <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
//               <div className="flex items-center">
//                 <span className="text-2xl mr-3">👥</span>
//                 <div>
//                   <h3 className="font-medium text-gray-900">Collaborations</h3>
//                   <p className="text-sm text-gray-600">Gérer vos co-auteurs</p>
//                 </div>
//               </div>
//             </button>
//             <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
//               <div className="flex items-center">
//                 <span className="text-2xl mr-3">📊</span>
//                 <div>
//                   <h3 className="font-medium text-gray-900">Statistiques</h3>
//                   <p className="text-sm text-gray-600">Voir vos métriques</p>
//                 </div>
//               </div>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function DashboardPage() {
//   return (
//     <ProtectedRoute allowedRoles={[UserRole.AUTHOR, UserRole.REVIEWER, UserRole.EDITOR, UserRole.ADMIN]}>
//       <DashboardContent />
//     </ProtectedRoute>
//   )
// }

// // app/layout.tsx - Layout racine avec AuthProvider
// import './globals.css'
// import { AuthProvider } from '@/hooks/useAuth'

// export const metadata = {
//   title: 'Revue Scientifique',
//   description: 'Plateforme de publication d\'articles scientifiques',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="fr">
//       <body>
//         <AuthProvider>
//           {children}
//         </AuthProvider>
//       </body>
//     </html>
//   )
// }