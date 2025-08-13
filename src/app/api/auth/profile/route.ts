
// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate } from '@/src/libs/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        title: true,
        affiliation: true,
        department: true,
        bio: true,
        orcid: true,
        // researchInterests: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            reviews: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: profile
    })

  } catch (error: any) {
    console.error('Profile error:', error)

    if (error.statusCode === 401) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
