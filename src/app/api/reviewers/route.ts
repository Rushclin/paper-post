// app/api/reviewers/route.ts - API pour récupérer la liste des reviewers
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate, authorize } from '@/src/libs/middleware'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    authorize([UserRole.ADMIN, UserRole.EDITOR])(user)

    const reviewers = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.REVIEWER, UserRole.EDITOR, UserRole.ADMIN]
        },
        isActive: true,
        isVerified: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        title: true,
        affiliation: true,
        department: true,
        // researchInterests: true,
        role: true
      },
      orderBy: [
        { role: 'asc' },
        { lastName: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      reviewers
    })

  } catch (error: any) {
    console.error('Get reviewers error:', error)

    if (error.statusCode === 401 || error.statusCode === 403) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}