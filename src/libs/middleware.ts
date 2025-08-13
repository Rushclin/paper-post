// lib/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
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

export async function authenticate(request: NextRequest): Promise<any> {
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
  return (user: any) => {
    if (!allowedRoles.includes(user.role)) {
      throw new AuthorizationError('Permissions insuffisantes')
    }
    return user
  }
}