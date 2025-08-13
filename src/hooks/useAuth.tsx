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
