// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { AuthService } from '@/src/libs/auth'
import { EmailService } from '@/src/libs/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email requis' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isVerified: true,
        isActive: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Email déjà vérifié' },
        { status: 400 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Compte désactivé' },
        { status: 400 }
      )
    }

    // Générer un nouveau token
    const verificationToken = AuthService.generateVerificationToken()

    // Mettre à jour ou créer le token
    await prisma.setting.upsert({
      where: { key: `verification_${user.id}` },
      update: { value: verificationToken },
      create: {
        key: `verification_${user.id}`,
        value: verificationToken,
        description: 'Email verification token'
      }
    })

    // Envoyer l'email
    await EmailService.sendVerificationEmail(user.email, verificationToken)

    return NextResponse.json({
      success: true,
      message: 'Email de vérification renvoyé'
    })

  } catch (error) {
    console.error('Resend verification error:', error)

    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'envoi' },
      { status: 500 }
    )
  }
}
