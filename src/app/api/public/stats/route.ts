// app/api/public/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'

export async function GET(request: NextRequest) {
  try {
    // Statistiques publiques
    const [
      totalArticles,
      totalAuthors,
      totalCategories,
      recentArticles
    ] = await Promise.all([
      // prisma.article.count({ where: { status: 'PUBLISHED' } }),
      // prisma.user.count({ where: { articles: { some: { status: 'PUBLISHED' } } } }),
       prisma.article.count({  }),
      prisma.user.count({ }),
      prisma.category.count(),
      prisma.article.count({
        where: {
          // status: 'PUBLISHED',
          publishedAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles,
        totalAuthors,
        totalCategories,
        recentArticles
      }
    })

  } catch (error) {
    console.error('Get public stats error:', error)

    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}