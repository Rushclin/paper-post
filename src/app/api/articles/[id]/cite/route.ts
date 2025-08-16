import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/libs/prisma";
import { CitationFormat } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const { format } = await request.json();
    
    // Vérifier que le format est valide
    if (!Object.values(CitationFormat).includes(format)) {
      return NextResponse.json(
        { success: false, message: "Format de citation invalide" },
        { status: 400 }
      );
    }
    
    // Récupérer l'adresse IP du client
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwarded?.split(",")[0] || realIp || "unknown";

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

    // Enregistrer la citation
    await prisma.articleCitation.create({
      data: {
        articleId,
        ipAddress,
        citationFormat: format as CitationFormat
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la citation:", error);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}