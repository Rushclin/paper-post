
// app/api/articles/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'
import { authenticate } from '@/src/libs/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request)

    // Compter les articles par statut
    const [
      total,
      drafts,
      submitted,
      underReview,
      revisionRequired,
      accepted,
      rejected,
      published,
      withdrawn
    ] = await Promise.all([
      prisma.article.count({ where: { authorId: user.id } }),
      prisma.article.count({ where: { authorId: user.id, status: 'DRAFT' } }),
      prisma.article.count({ where: { authorId: user.id, status: 'SUBMITTED' } }),
      prisma.article.count({ where: { authorId: user.id, status: 'UNDER_REVIEW' } }),
      prisma.article.count({ where: { authorId: user.id, status: 'REVISION_REQUIRED' } }),
      prisma.article.count({ where: { authorId: user.id, status: 'ACCEPTED' } }),
      prisma.article.count({ where: { authorId: user.id, status: 'REJECTED' } }),
      prisma.article.count({ where: { authorId: user.id, status: 'PUBLISHED' } }),
      prisma.article.count({ where: { authorId: user.id, status: 'WITHDRAWN' } })
    ])

    // Calculer les citations (simulation - dans un vrai système, cela viendrait d'une base de données de citations)
    const citations = published * Math.floor(Math.random() * 20) + accepted * Math.floor(Math.random() * 5)

    // Calculer le temps moyen de review (simulation)
    const reviews = await prisma.review.findMany({
      where: {
        article: {
          authorId: user.id
        },
        isCompleted: true,
        submittedAt: { not: null }
      },
      include: {
        submission: {
          select: {
            submittedAt: true
          }
        }
      }
    })

    let averageReviewTime = 0
    if (reviews.length > 0) {
      const totalReviewTime = reviews.reduce((sum, review) => {
        if (review.submittedAt && review.submission.submittedAt) {
          const reviewTime = new Date(review.submittedAt).getTime() - new Date(review.submission.submittedAt).getTime()
          return sum + (reviewTime / (1000 * 60 * 60 * 24)) // Convert to days
        }
        return sum
      }, 0)
      averageReviewTime = Math.round(totalReviewTime / reviews.length)
    }

    // Calculer le taux d'acceptation
    const submittedTotal = submitted + underReview + accepted + rejected + published
    const acceptanceRate = submittedTotal > 0 ? Math.round(((accepted + published) / submittedTotal) * 100) : 0

    const stats = {
      total,
      drafts,
      submitted,
      underReview,
      revisionRequired,
      accepted,
      rejected,
      published,
      withdrawn,
      citations,
      averageReviewTime,
      acceptanceRate
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error('Get stats error:', error)

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
