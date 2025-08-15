// app/api/submissions/[id]/decision/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate, authorize } from '@/src/libs/middleware'
import { sendEmail } from '@/src/libs/email'
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

    // Vérifier que la soumission existe et récupérer les informations nécessaires
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { 
        article: {
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

    // Envoyer une notification par email à l'auteur
    try {
      const decisionMessages = {
        'ACCEPT': {
          subject: `Article accepté : ${submission.article.title}`,
          message: `Félicitations ! Votre article "${submission.article.title}" a été accepté pour publication.`
        },
        'REJECT': {
          subject: `Article refusé : ${submission.article.title}`,
          message: `Nous regrettons de vous informer que votre article "${submission.article.title}" n'a pas été accepté pour publication.`
        },
        'REVISION_REQUIRED': {
          subject: `Révision requise : ${submission.article.title}`,
          message: `Votre article "${submission.article.title}" nécessite des révisions avant publication.`
        }
      }

      const emailContent = decisionMessages[decision as keyof typeof decisionMessages]
      
      await sendEmail(
        submission.article.author.email,
        emailContent.subject,
        `
          <h2>Décision éditoriale</h2>
          <p>Cher/Chère ${submission.article.author.firstName} ${submission.article.author.lastName},</p>
          <p>${emailContent.message}</p>
          ${editorComments ? `<p><strong>Commentaires de l'éditeur :</strong><br>${editorComments}</p>` : ''}
          <p>Cordialement,<br>L'équipe éditoriale</p>
        `
      )
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // Ne pas faire échouer la requête si l'email échoue
    }

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