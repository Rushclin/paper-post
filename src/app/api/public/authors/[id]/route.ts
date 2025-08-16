import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/libs/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Récupérer les informations de l'auteur
    const author = await prisma.user.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        affiliation: true,
        department: true,
        bio: true,
        orcid: true,
        createdAt: true,
      },
    });

    if (!author) {
      return NextResponse.json(
        { success: false, message: "Auteur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les articles publiés de l'auteur
    const articles = await prisma.article.findMany({
      where: {
        authorId: id,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        abstract: true,
        publishedAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            views: true,
            citations: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    // Calculer les statistiques détaillées
    const totalViews = await prisma.articleView.count({
      where: {
        article: {
          authorId: id,
          status: "PUBLISHED",
        },
      },
    });

    const totalCitations = await prisma.articleCitation.count({
      where: {
        article: {
          authorId: id,
          status: "PUBLISHED",
        },
      },
    });

    // Statistiques par mois (12 derniers mois)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyViews = await prisma.articleView.groupBy({
      by: ['viewedAt'],
      where: {
        article: {
          authorId: id,
          status: "PUBLISHED",
        },
        viewedAt: {
          gte: twelveMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    const monthlyCitations = await prisma.articleCitation.groupBy({
      by: ['citedAt'],
      where: {
        article: {
          authorId: id,
          status: "PUBLISHED",
        },
        citedAt: {
          gte: twelveMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Calculer le H-index
    const citationCounts = articles
      .map((article) => article._count.citations)
      .sort((a, b) => b - a);

    let hIndex = 0;
    for (let i = 0; i < citationCounts.length; i++) {
      if (citationCounts[i] >= i + 1) {
        hIndex = i + 1;
      } else {
        break;
      }
    }

    // Statistiques par catégorie
    const categoriesStats = await prisma.article.groupBy({
      by: ['categoryId'],
      where: {
        authorId: id,
        status: "PUBLISHED",
      },
      _count: {
        id: true,
      },
      // _sum: {
        // Note: Nous devrons calculer cela différemment car Prisma ne supporte pas _sum sur des relations
      // },
    });

    const categoriesWithNames = await Promise.all(
      categoriesStats.map(async (stat) => {
        const category = await prisma.category.findUnique({
          where: { id: stat.categoryId },
          select: { name: true, slug: true },
        });
        return {
          category: category,
          articleCount: stat._count.id,
        };
      })
    );

    // Collaborateurs fréquents (co-auteurs)
    const collaborators = await prisma.articleAuthor.findMany({
      where: {
        article: {
          authorId: id,
          status: "PUBLISHED",
        },
      },
      select: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            affiliation: true,
          },
        },
      },
    });

    const collaboratorStats = collaborators.reduce((acc, collab) => {
      const authorId = collab.author.id;
      if (!acc[authorId]) {
        acc[authorId] = {
          author: collab.author,
          collaborationCount: 0,
        };
      }
      acc[authorId].collaborationCount++;
      return acc;
    }, {} as Record<string, any>);

    const topCollaborators = Object.values(collaboratorStats)
      .sort((a: any, b: any) => b.collaborationCount - a.collaborationCount)
      .slice(0, 10);

    const response = {
      author,
      articles,
      stats: {
        totalArticles: articles.length,
        totalViews,
        totalCitations,
        hIndex,
        categoriesStats: categoriesWithNames,
        monthlyViews: monthlyViews.map(mv => ({
          month: mv.viewedAt.toISOString().slice(0, 7), // YYYY-MM format
          views: mv._count.id,
        })),
        monthlyCitations: monthlyCitations.map(mc => ({
          month: mc.citedAt.toISOString().slice(0, 7),
          citations: mc._count.id,
        })),
        topCollaborators,
      },
    };

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("Error fetching author details:", error);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}