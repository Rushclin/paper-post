// app/api/articles/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate } from '@/src/libs/middleware'
import { submissionSchema } from '@/src/libs/validation'
import { ArticleStatus } from '@prisma/client'

// POST /api/articles/[id]/submit - Soumettre un article pour review
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(request)
    const { id } = await params
    const body = await request.json()

    // Validation des données
    try {
      submissionSchema.parse(body)
    } catch (validationError: unknown) {
      return NextResponse.json(
        { success: false, message: 'Données de soumission invalides', errors: validationError && typeof validationError === 'object' && 'errors' in validationError ? (validationError as { errors: unknown }).errors : [] },
        { status: 400 }
      )
    }

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        status: true,
        title: true,
        manuscriptUrl: true,
        abstract: true,
        content: true
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

    // Vérifier que l'article est complet
    const missingFields = []
    if (!article.abstract || article.abstract.length < 100) {
      missingFields.push('Résumé (minimum 100 caractères)')
    }
    if (!article.content || article.content.length < 1000) {
      missingFields.push('Contenu (minimum 1000 caractères)')
    }
    if (!article.manuscriptUrl) {
      missingFields.push('Fichier manuscrit')
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Article incomplet. Champs manquants : ${missingFields.join(', ')}` 
        },
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