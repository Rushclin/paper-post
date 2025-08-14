// app/api/submissions/[id]/review/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate, authorize } from '@/src/libs/middleware'
import { UserRole, ReviewDecision } from '@prisma/client'

// POST /api/submissions/[id]/review - Soumettre une review
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request)
    authorize([UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER])(user)

    const { id } = params
    const {
      recommendation,
      comments,
      confidentialComments,
      technicalQuality,
      novelty,
      significance,
      clarity,
      overallScore
    } = await request.json()

    // Validation
    if (!recommendation || !Object.values(ReviewDecision).includes(recommendation)) {
      return NextResponse.json(
        { success: false, message: 'Recommandation invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la soumission existe
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { article: true }
    })

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Soumission non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur peut reviewer cette soumission
    const canReview = user.role === UserRole.ADMIN ||
                     user.role === UserRole.EDITOR ||
                     (user.role === UserRole.REVIEWER && 
                      await prisma.editorAssignment.findFirst({
                        where: {
                          submissionId: id,
                          editorId: user.id,
                          isActive: true
                        }
                      }))

    if (!canReview) {
      return NextResponse.json(
        { success: false, message: 'Vous n\'êtes pas autorisé à reviewer cette soumission' },
        { status: 403 }
      )
    }

    // Créer ou mettre à jour la review
    const review = await prisma.review.upsert({
      where: {
        submissionId_reviewerId: {
          submissionId: id,
          reviewerId: user.id
        }
      },
      update: {
        recommendation,
        comments: comments || '',
        confidentialComments: confidentialComments || '',
        technicalQuality: technicalQuality || 1,
        novelty: novelty || 1,
        significance: significance || 1,
        clarity: clarity || 1,
        overallScore: overallScore || 1,
        isCompleted: true,
        submittedAt: new Date()
      },
      create: {
        submissionId: id,
        articleId: submission.articleId,
        reviewerId: user.id,
        recommendation,
        comments: comments || '',
        confidentialComments: confidentialComments || '',
        technicalQuality: technicalQuality || 1,
        novelty: novelty || 1,
        significance: significance || 1,
        clarity: clarity || 1,
        overallScore: overallScore || 1,
        isCompleted: true,
        submittedAt: new Date()
      }
    })

    // Vérifier si toutes les reviews sont terminées
    const allReviews = await prisma.review.findMany({
      where: { submissionId: id }
    })

    const completedReviews = allReviews.filter(r => r.isCompleted)
    const totalAssignments = await prisma.editorAssignment.count({
      where: { submissionId: id, isActive: true }
    })

    if (completedReviews.length === totalAssignments) {
      // Toutes les reviews sont terminées, mettre à jour le statut
      await prisma.submission.update({
        where: { id },
        data: { status: 'DECISION_MADE' }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Review soumise avec succès',
      review
    })

  } catch (error: any) {
    console.error('Submit review error:', error)

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
