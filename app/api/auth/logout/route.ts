import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true,
      message: 'Logout exitoso'
    })

    // Eliminar cookie
    response.cookies.delete('admin-token')

    return response
  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json(
      { success: false, message: 'Error al procesar el logout' },
      { status: 500 }
    )
  }
}


