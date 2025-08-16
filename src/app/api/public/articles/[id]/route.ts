// app/api/public/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const article = await prisma.article.findUnique({
      where: { 
        id,
        // status: 'PUBLISHED' // Seuls les articles publiés sont accessibles publiquement
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        },
        journal: {
          select: { 
            id: true, 
            name: true, 
            issn: true,
            description: true
          }
        },
        issue: {
          select: { 
            id: true, 
            volume: true, 
            number: true, 
            year: true,
            title: true,
            description: true
          }
        },
        _count: {
          select: {
            views: true,
            citations: true
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, message: 'Article non trouvé ou non publié' },
        { status: 404 }
      )
    }

    // Incrémenter le compteur de vues (optionnel)
    // await prisma.article.update({
    //   where: { id },
    //   data: { views: { increment: 1 } }
    // })

    return NextResponse.json({
      success: true,
      article
    })

  } catch (error) {
    console.error('Get public article error:', error)

    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
