// app/api/public/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    // Construire les filtres pour les articles publiés uniquement
    const where: any = {
      // status: 'PUBLISHED' // TODO
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { keywords: { hasSome: [search] } }
      ]
    }

    if (category) {
      where.categoryId = category
    }

    // Compter le total
    const total = await prisma.article.count({ where })

    // Récupérer les articles publiés
    const articles = await prisma.article.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            affiliation: true,
            department: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
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
                affiliation: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        journal: {
          select: {
            id: true,
            name: true,
            issn: true
          }
        },
        issue: {
          select: {
            id: true,
            volume: true,
            number: true,
            year: true
          }
        },
        _count: {
          select: {
            reviews: true,
            citations: true,
            views: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      skip: offset,
      take: limit
    })

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get public articles error:', error)

    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
