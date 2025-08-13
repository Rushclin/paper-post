// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate } from '@/src/libs/middleware'
import { articleSchema } from '@/src/libs/validation'
import { NotFoundError, AuthorizationError } from '@/src/libs/errors'

interface RouteParams {
  params: { id: string }
}

// GET /api/articles/[id] - Récupérer un article spécifique
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticate(request)
    const { id } = params

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
            affiliation: true
          }
        },
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
                email: true,
                title: true,
                affiliation: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        submissions: {
          include: {
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
          orderBy: { submittedAt: 'desc' }
        },
        journal: {
          select: { id: true, name: true }
        },
        issue: {
          select: { id: true, volume: true, number: true, year: true }
        }
      }
    })

    if (!article) {
      throw new NotFoundError('Article non trouvé')
    }

    // Vérifier les permissions
    const isAuthor = article.authorId === user.id
    const isCoAuthor = article.coAuthors.some(ca => ca.authorId === user.id)
    const canView = isAuthor || isCoAuthor || ['EDITOR', 'ADMIN'].includes(user.role)

    if (!canView) {
      throw new AuthorizationError('Vous n\'avez pas accès à cet article')
    }

    return NextResponse.json({
      success: true,
      article
    })

  } catch (error: any) {
    console.error('Get article error:', error)

    if (error.statusCode) {
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

// PUT /api/articles/[id] - Modifier un article
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticate(request)
    const { id } = params
    const body = await request.json()

    // Vérifier que l'article existe et que l'utilisateur peut le modifier
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      include: {
        coAuthors: true
      }
    })

    if (!existingArticle) {
      throw new NotFoundError('Article non trouvé')
    }

    const isAuthor = existingArticle.authorId === user.id
    const isCoAuthor = existingArticle.coAuthors.some(ca => ca.authorId === user.id)
    const canEdit = isAuthor || (isCoAuthor && ['DRAFT', 'REVISION_REQUIRED'].includes(existingArticle.status))

    if (!canEdit) {
      throw new AuthorizationError('Vous ne pouvez pas modifier cet article')
    }

    // Validation des données
    const validatedData = articleSchema.parse(body)

    // Traitement des mots-clés
    const keywords = validatedData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    // Mise à jour de l'article
    const article = await prisma.article.update({
      where: { id },
      data: {
        title: validatedData.title,
        abstract: validatedData.abstract,
        content: validatedData.content,
        // keywords,
        language: validatedData.language,
        categoryId: validatedData.categoryId,
        updatedAt: new Date()
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

    // Gérer les co-auteurs si fournis
    if (validatedData.coAuthorEmails) {
      // Supprimer les anciens co-auteurs
      await prisma.articleAuthor.deleteMany({
        where: { articleId: id }
      })

      // Ajouter les nouveaux co-auteurs
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
          await prisma.articleAuthor.create({
            data: {
              articleId: id,
              authorId: coAuthor.id,
              order: i + 2,
              isCorresponding: false
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Article modifié avec succès',
      article
    })

  } catch (error: any) {
    console.error('Update article error:', error)

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

    if (error.statusCode) {
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

// DELETE /api/articles/[id] - Supprimer un article
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticate(request)
    const { id } = params

    // Vérifier que l'article existe et que l'utilisateur peut le supprimer
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        authorId: true,
        status: true,
        title: true
      }
    })

    if (!article) {
      throw new NotFoundError('Article non trouvé')
    }

    // Seul l'auteur principal peut supprimer et seulement si c'est un brouillon
    if (article.authorId !== user.id) {
      throw new AuthorizationError('Seul l\'auteur principal peut supprimer l\'article')
    }

    if (article.status !== 'DRAFT') {
      throw new AuthorizationError('Vous ne pouvez supprimer que les brouillons')
    }

    // Supprimer l'article (cascade supprimera les relations)
    await prisma.article.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Article supprimé avec succès'
    })

  } catch (error: any) {
    console.error('Delete article error:', error)

    if (error.statusCode) {
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