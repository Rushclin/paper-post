import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/libs/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "lastName";
    const sortDirection = searchParams.get("sortDirection") || "asc";

    const skip = (page - 1) * limit;

    // Construire la clause where pour la recherche
    const whereClause = search
      ? {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              affiliation: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    // Récupérer les auteurs avec leurs statistiques
    const authors = await prisma.user.findMany({
      where: {
        ...whereClause,
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
        _count: {
          select: {
            articles: {
              // where: {
              //   status: "PUBLISHED",
              // },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortDirection as "asc" | "desc",
      },
    });

    // Calculer les statistiques pour chaque auteur
    const authorsWithStats = await Promise.all(
      authors.map(async (author) => {
        // Compter les vues totales sur tous ses articles
        const totalViews = await prisma.articleView.count({
          where: {
            article: {
              authorId: author.id,
              // status: "PUBLISHED",
            },
          },
        });

        // Compter les citations totales sur tous ses articles
        const totalCitations = await prisma.articleCitation.count({
          where: {
            article: {
              authorId: author.id,
              // status: "PUBLISHED",
            },
          },
        });

        // H-index approximatif (nombre d'articles ayant au moins h citations)
        const articleCitations = await prisma.article.findMany({
          where: {
            authorId: author.id,
            // status: "PUBLISHED",
          },
          select: {
            _count: {
              select: {
                citations: true,
              },
            },
          },
        });

        const citationCounts = articleCitations
          .map((a) => a._count.citations)
          .sort((a, b) => b - a);

        let hIndex = 0;
        for (let i = 0; i < citationCounts.length; i++) {
          if (citationCounts[i] >= i + 1) {
            hIndex = i + 1;
          } else {
            break;
          }
        }

        return {
          ...author,
          stats: {
            totalArticles: author._count.articles,
            totalViews,
            totalCitations,
            hIndex,
          },
        };
      })
    );

    // Compter le total pour la pagination
    const total = await prisma.user.count({
      where: {
        ...whereClause,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      authors: authorsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}