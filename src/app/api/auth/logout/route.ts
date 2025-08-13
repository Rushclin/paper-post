
// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    })

    // Supprimer le cookie d'authentification
    response.cookies.delete('auth-token')

    return response

  } catch (error) {
    console.error('Logout error:', error)

    return NextResponse.json(
      { success: false, message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    )
  }
}
