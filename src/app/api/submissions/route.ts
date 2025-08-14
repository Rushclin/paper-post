// app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate, authorize } from '@/src/libs/middleware'
import { UserRole } from '@prisma/client'

// GET /api/submissions - Lister les soumissions selon le rôle
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    // Seuls les ADMIN, EDITOR et REVIEWER peuvent voir les soumissions
    authorize([UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER])(user)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    // Construire les filtres selon le rôle
    let where: any = {}

    // Les EDITOR et ADMIN voient toutes les soumissions
    // Les REVIEWER ne voient que celles qui leur sont assignées
    if (user.role === UserRole.REVIEWER) {
      where = {
        article: {
          submissions: {
            some: {
              editorAssignments: {
                some: {
                  editorId: user.id,
                  isActive: true
                }
              }
            }
          }
        }
      }
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.article = {
        ...where.article,
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { abstract: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Compter le total
    const total = await prisma.submission.count({ where })

    // Récupérer les soumissions
    const submissions = await prisma.submission.findMany({
      where,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            abstract: true,
            status: true,
            // keywords: true,
            categoryId: true,
            category: {
              select: { name: true }
            },
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                affiliation: true
              }
            },
            coAuthors: {
              include: {
                author: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
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
                email: true
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
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      skip: offset,
      take: limit
    })

    return NextResponse.json({
      success: true,
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('Get submissions error:', error)

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
