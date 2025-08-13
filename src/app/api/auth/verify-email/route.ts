// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de vérification requis' },
        { status: 400 }
      )
    }

    // Trouver le token de vérification
    const verificationRecord = await prisma.setting.findFirst({
      where: {
        key: { startsWith: 'verification_' },
        value: token
      }
    })

    if (!verificationRecord) {
      return NextResponse.json(
        { success: false, message: 'Token de vérification invalide ou expiré' },
        { status: 400 }
      )
    }

    // Extraire l'ID utilisateur du key
    const userId = verificationRecord.key.replace('verification_', '')

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true
      }
    })

    // Supprimer le token de vérification
    await prisma.setting.delete({
      where: { id: verificationRecord.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès',
      user
    })

  } catch (error) {
    console.error('Email verification error:', error)

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
