// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/libs/prisma";
import { AuthService } from "@/src/libs/auth";
import { registerSchema } from "@/src/libs/validation";
import { ZodError } from "zod";
import { EmailService } from "@/src/libs/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Vérifier si l'ORCID existe déjà (si fourni)
    if (validatedData.orcid) {
      const existingOrcid = await prisma.user.findUnique({
        where: { orcid: validatedData.orcid },
      });

      if (existingOrcid) {
        return NextResponse.json(
          { success: false, message: "Cet ORCID est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await AuthService.hashPassword(
      validatedData.password
    );

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        title: validatedData.title,
        affiliation: validatedData.affiliation,
        department: validatedData.department,
        bio: validatedData.bio,
        orcid: validatedData.orcid || null,
        // researchInterests: validatedData.researchInterests,
        role: validatedData.role,
        isVerified: false, // Nécessite une vérification email
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Générer un token de vérification
    const verificationToken = AuthService.generateVerificationToken();

    // Stocker le token (vous pourriez vouloir créer une table pour les tokens)
    // Pour l'exemple, on utilise une approche simple
    await prisma.setting.upsert({
      where: { key: `verification_${user.id}` },
      update: { value: verificationToken },
      create: {
        key: `verification_${user.id}`,
        value: verificationToken,
        description: "Email verification token",
      },
    });

    // Envoyer l'email de vérification
    await EmailService.sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({
      success: true,
      message:
        "Compte créé avec succès. Vérifiez votre email pour activer votre compte.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.name instanceof ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      error.errors.forEach((err: any) => {
        const field = err.path.join(".");
        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }
        formattedErrors[field].push(err.message);
      });

      return NextResponse.json(
        {
          success: false,
          message: "Données invalides",
          errors: formattedErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}









// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const errors: Record<string, string[]> = {};

//     // ✅ Validation Zod
//     let validatedData;
//     try {
//       validatedData = registerSchema.parse(body);
//     } catch (err: any) {
//       if (err instanceof ZodError) {
//         err.errors.forEach((e) => {
//           const field = e.path.join(".");
//           if (!errors[field]) errors[field] = [];
//           errors[field].push(e.message);
//         });
//       } else {
//         throw err; // Ce n'est pas une erreur Zod → on laisse Next.js gérer
//       }
//     }

//     // Si Zod a trouvé des erreurs → pas besoin de continuer
//     if (Object.keys(errors).length > 0) {
//       return NextResponse.json(
//         { success: false, message: "Données invalides", errors },
//         { status: 400 }
//       );
//     }

//     // ✅ Vérifier email unique
//     const existingUser = await prisma.user.findUnique({
//       where: { email: validatedData?.email },
//     });
//     if (existingUser) {
//       errors.email = ["Cet email est déjà utilisé"];
//     }

//     // ✅ Vérifier ORCID unique (si fourni)
//     if (validatedData?.orcid) {
//       const existingOrcid = await prisma.user.findUnique({
//         where: { orcid: validatedData.orcid },
//       });
//       if (existingOrcid) {
//         errors.orcid = ["Cet ORCID est déjà utilisé"];
//       }
//     }

//     // ✅ Si on a accumulé des erreurs → les renvoyer
//     if (Object.keys(errors).length > 0) {
//       return NextResponse.json(
//         { success: false, message: "Erreurs de validation", errors },
//         { status: 400 }
//       );
//     }

//     // 🔹 Hasher mot de passe
//     const hashedPassword = await AuthService.hashPassword(
//       validatedData!.password
//     );

//     // 🔹 Créer l'utilisateur
//     const user = await prisma.user.create({
//       data: {
//         email: validatedData!.email,
//         password: hashedPassword,
//         firstName: validatedData!.firstName,
//         lastName: validatedData!.lastName,
//         title: validatedData!.title,
//         affiliation: validatedData!.affiliation,
//         department: validatedData!.department,
//         bio: validatedData!.bio,
//         orcid: validatedData!.orcid || null,
//         role: validatedData!.role,
//         isVerified: false,
//       },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         isVerified: true,
//         createdAt: true,
//       },
//     });

//     // 🔹 Générer token vérif
//     const verificationToken = AuthService.generateVerificationToken();

//     await prisma.setting.upsert({
//       where: { key: `verification_${user.id}` },
//       update: { value: verificationToken },
//       create: {
//         key: `verification_${user.id}`,
//         value: verificationToken,
//         description: "Email verification token",
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message:
//         "Compte créé avec succès. Vérifiez votre email pour activer votre compte.",
//       user,
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return NextResponse.json(
//       { success: false, message: "Erreur interne du serveur" },
//       { status: 500 }
//     );
//   }
// }
