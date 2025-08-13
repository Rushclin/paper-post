// app/api/articles/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate } from '@/src/libs/middleware'
import { ArticleStatus } from '@prisma/client'

// POST /api/articles/[id]/submit - Soumettre un article pour review
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request)
    const { id } = params
    const body = await request.json()

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        status: true,
        title: true
      }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, message: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (article.authorId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Seul l\'auteur principal peut soumettre l\'article' },
        { status: 403 }
      )
    }

    // Vérifier le statut
    if (!['DRAFT', 'REVISION_REQUIRED'].includes(article.status)) {
      return NextResponse.json(
        { success: false, message: 'Cet article ne peut pas être soumis dans son état actuel' },
        { status: 400 }
      )
    }

    // Créer la soumission
    await prisma.submission.create({
      data: {
        articleId: id,
        submitterId: user.id,
        coverLetter: body.coverLetter || '',
        ethicsStatement: body.ethicsStatement || '',
        conflictOfInterest: body.conflictOfInterest || '',
        status: 'PENDING'
      }
    })

    // Mettre à jour l'article
    await prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.SUBMITTED,
        submittedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Article soumis avec succès pour évaluation'
    })

  } catch (error: any) {
    console.error('Submit article error:', error)

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