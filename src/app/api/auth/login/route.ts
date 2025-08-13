// app/api/auth/login/route.ts
import { loginSchema } from '@/src/libs/validation'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { AuthService } from '@/src/libs/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation des données
    const validatedData = loginSchema.parse(body)

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isValidPassword = await AuthService.verifyPassword(
      validatedData.password,
      user.password
    )

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Compte désactivé' },
        { status: 401 }
      )
    }

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Veuillez vérifier votre email avant de vous connecter',
          needsVerification: true 
        },
        { status: 401 }
      )
    }

    // Générer le token JWT
    const authUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified
    }

    const token = AuthService.generateToken(authUser)

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: authUser,
      token
    })

    // Optionnel: Définir un cookie sécurisé pour le token
    if (validatedData.rememberMe) {
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 jours
      })
    }

    return response

  } catch (error: any) {
    console.error('Login error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Données invalides' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}