// app/api/submissions/[id]/decision/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate, authorize } from '@/src/libs/middleware'
import { UserRole, ArticleStatus } from '@prisma/client'

// POST /api/submissions/[id]/decision - Prendre une décision finale
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request)
    // Seuls les ADMIN et EDITOR peuvent prendre des décisions finales
    authorize([UserRole.ADMIN, UserRole.EDITOR])(user)

    const { id } = params
    const { decision, editorComments } = await request.json()

    // Validation
    const validDecisions = ['ACCEPT', 'REJECT', 'REVISION_REQUIRED']
    if (!validDecisions.includes(decision)) {
      return NextResponse.json(
        { success: false, message: 'Décision invalide' },
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

    // Déterminer le nouveau statut de l'article
    let articleStatus: ArticleStatus
    switch (decision) {
      case 'ACCEPT':
        articleStatus = 'ACCEPTED'
        break
      case 'REJECT':
        articleStatus = 'REJECTED'
        break
      case 'REVISION_REQUIRED':
        articleStatus = 'REVISION_REQUIRED'
        break
      default:
        articleStatus = submission.article.status
    }

    // Mettre à jour l'article
    await prisma.article.update({
      where: { id: submission.articleId },
      data: { status: articleStatus }
    })

    // Marquer la soumission comme terminée
    await prisma.submission.update({
      where: { id },
      data: { status: 'COMPLETED' }
    })

    // Créer un enregistrement de décision (optionnel)
    // await prisma.editorialDecision.create({
    //   data: {
    //     submissionId: id,
    //     editorId: user.id,
    //     decision,
    //     comments: editorComments || ''
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: `Article ${decision === 'ACCEPT' ? 'accepté' : decision === 'REJECT' ? 'rejeté' : 'renvoyé pour révision'}`,
      decision,
      articleStatus
    })

  } catch (error: any) {
    console.error('Editorial decision error:', error)

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