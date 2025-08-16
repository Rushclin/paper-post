import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/libs/prisma";
import jwt from "jsonwebtoken";

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token d'authentification requis" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const {
      firstName,
      lastName,
      title,
      affiliation,
      department,
      bio,
      orcid,
    } = body;

    // Validation basique
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: "Le prénom et le nom sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'ORCID existe déjà (si fourni)
    if (orcid) {
      const existingOrcid = await prisma.user.findFirst({
        where: {
          orcid,
          NOT: { id: userId },
        },
      });

      if (existingOrcid) {
        return NextResponse.json(
          { success: false, message: "Cet ORCID est déjà utilisé par un autre utilisateur" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le profil
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        title: title || null,
        affiliation: affiliation || null,
        department: department || null,
        bio: bio || null,
        orcid: orcid || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        title: true,
        affiliation: true,
        department: true,
        bio: true,
        orcid: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}