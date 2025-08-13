
// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/libs/prisma'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // Catégories principales
      include: {
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        _count: {
          select: { articles: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      categories
    })

  } catch (error) {
    console.error('Categories error:', error)

    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement des catégories' },
      { status: 500 }
    )
  }
}