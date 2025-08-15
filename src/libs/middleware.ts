// lib/middleware.ts
import { NextRequest } from 'next/server'
import { AuthService } from './auth'
import { prisma } from './prisma'
import { AuthenticationError, AuthorizationError } from './errors'
import { UserRole } from '@prisma/client'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: UserRole
  }
}

interface User {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  isVerified: boolean
}

export async function authenticate(request: NextRequest): Promise<User> {
  const token = AuthService.extractTokenFromHeader(
    request.headers.get('authorization') || ''
  )

  if (!token) {
    throw new AuthenticationError('Token manquant')
  }

  const payload = AuthService.verifyToken(token)
  if (!payload) {
    throw new AuthenticationError('Token invalide')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      isVerified: true
    }
  })

  if (!user || !user.isActive) {
    throw new AuthenticationError('Utilisateur non trouvé ou inactif')
  }

  if (!user.isVerified) {
    throw new AuthenticationError('Compte non vérifié')
  }

  return user
}

export function authorize(allowedRoles: UserRole[]) {
  return (user: User) => {
    if (!allowedRoles.includes(user.role)) {
      throw new AuthorizationError('Permissions insuffisantes')
    }
    return user
  }
}