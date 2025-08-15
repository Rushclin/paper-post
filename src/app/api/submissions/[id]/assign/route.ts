
// app/api/submissions/[id]/assign/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate, authorize } from '@/src/libs/middleware'
import { UserRole } from '@prisma/client'

// POST /api/submissions/[id]/assign - Assigner des reviewers
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(request)
    // Seuls les ADMIN et EDITOR peuvent assigner des reviewers
    authorize([UserRole.ADMIN, UserRole.EDITOR])(user)

    const { id } = await params
    const { reviewerIds } = await request.json()

    if (!Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Au moins un reviewer doit être sélectionné' },
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

    // Créer les assignments d'éditeurs (reviewers)
    const assignments = await Promise.all(
      reviewerIds.map(reviewerId =>
        prisma.editorAssignment.create({
          data: {
            submissionId: id,
            editorId: reviewerId
          }
        })
      )
    )

    // Mettre à jour le statut de la soumission
    await prisma.submission.update({
      where: { id },
      data: { status: 'REVIEWING' }
    })

    // Mettre à jour le statut de l'article
    await prisma.article.update({
      where: { id: submission.articleId },
      data: { status: 'UNDER_REVIEW' }
    })

    return NextResponse.json({
      success: true,
      message: 'Reviewers assignés avec succès',
      assignments
    })

  } catch (error: any) {
    console.error('Assign reviewers error:', error)

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