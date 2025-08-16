import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/libs/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    
    // Récupérer l'adresse IP du client
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwarded?.split(",")[0] || realIp || "unknown";
    
    // Récupérer le user agent
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Vérifier si l'article existe
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Enregistrer la vue
    await prisma.articleView.create({
      data: {
        articleId,
        ipAddress,
        userAgent
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vue:", error);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}