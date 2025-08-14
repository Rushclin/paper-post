// app/api/submissions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate, authorize } from '@/src/libs/middleware'
import { UserRole } from '@prisma/client'

interface RouteParams {
  params: { id: string }
}

// GET /api/submissions/[id] - Récupérer une soumission spécifique
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticate(request)
    authorize([UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER])(user)

    const { id } = params

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                title: true,
                affiliation: true,
                department: true,
                bio: true,
                orcid: true
              }
            },
            category: {
              select: { 
                id: true, 
                name: true, 
                slug: true,
                description: true
              }
            },
            coAuthors: {
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    title: true,
                    affiliation: true,
                    department: true,
                    orcid: true
                  }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        editorAssignments: {
          where: { isActive: true },
          include: {
            editor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Soumission non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    const canView = user.role === UserRole.ADMIN || 
                   user.role === UserRole.EDITOR ||
                   (user.role === UserRole.REVIEWER && 
                    submission.editorAssignments.some(ea => ea.editorId === user.id))

    if (!canView) {
      return NextResponse.json(
        { success: false, message: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      submission
    })

  } catch (error: any) {
    console.error('Get submission error:', error)

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