// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate } from '@/src/libs/middleware'
import { articleSchema } from '@/src/libs/validation'
import { ArticleStatus } from '@prisma/client'

// GET /api/articles - Lister les articles de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as ArticleStatus | null
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const offset = (page - 1) * limit

    // Construire les filtres
    const where: any = {
      authorId: user.id
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search,  } },
        { abstract: { contains: search,  } },
        // { keywords: { hasSome: [search] } }
      ]
    }

    if (category) {
      where.categoryId = category
    }

    // Compter le total
    const total = await prisma.article.count({ where })

    // Récupérer les articles
    const articles = await prisma.article.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        coAuthors: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            reviews: true,
            submissions: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
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

  } catch (error: any) {
    console.error('Get articles error:', error)

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

// POST /api/articles - Créer un nouvel article
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request)
    const body = await request.json()

    // Validation des données
    const validatedData = articleSchema.parse(body)

    // Traitement des mots-clés
    const keywords = validatedData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    // Traitement des co-auteurs
    let coAuthorsData: any[] = []
    if (validatedData.coAuthorEmails) {
      const emails = validatedData.coAuthorEmails
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)

      for (let i = 0; i < emails.length; i++) {
        const email = emails[i]
        const coAuthor = await prisma.user.findUnique({
          where: { email },
          select: { id: true }
        })

        if (coAuthor) {
          coAuthorsData.push({
            authorId: coAuthor.id,
            order: i + 2, // L'auteur principal est order 1
            isCorresponding: false
          })
        }
      }
    }

    // Créer l'article
    const article = await prisma.article.create({
      data: {
        title: validatedData.title,
        abstract: validatedData.abstract,
        content: validatedData.content,
        // keywords,
        language: validatedData.language,
        status: ArticleStatus.DRAFT,
        authorId: user.id,
        categoryId: validatedData.categoryId,
        coAuthors: {
          create: coAuthorsData
        }
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        coAuthors: {
          include: {
            author: {
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

    // Si ce n'est pas un brouillon, créer une soumission
    if (body.submit === true) {
      await prisma.submission.create({
        data: {
          articleId: article.id,
          submitterId: user.id,
          coverLetter: validatedData.coverLetter,
          ethicsStatement: validatedData.ethicsStatement,
          conflictOfInterest: validatedData.conflictOfInterest,
          status: 'PENDING'
        }
      })

      // Mettre à jour le statut de l'article
      await prisma.article.update({
        where: { id: article.id },
        data: { 
          status: ArticleStatus.SUBMITTED,
          submittedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: body.submit ? 'Article soumis avec succès' : 'Brouillon sauvegardé',
      article
    })

  } catch (error: any) {
    console.error('Create article error:', error)

    if (error.name === 'ZodError') {
      const formattedErrors: Record<string, string[]> = {}
      error.errors.forEach((err: any) => {
        const field = err.path.join('.')
        if (!formattedErrors[field]) {
          formattedErrors[field] = []
        }
        formattedErrors[field].push(err.message)
      })

      return NextResponse.json(
        {
          success: false,
          message: 'Données invalides',
          errors: formattedErrors
        },
        { status: 400 }
      )
    }

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
