import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Credenciales y secreto JWT deben existir en el entorno (sin valores por defecto en código).
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    if (!adminUsername || !adminPassword || !jwtSecret) {
      console.error('Login: faltan ADMIN_USERNAME, ADMIN_PASSWORD o JWT_SECRET en el entorno')
      return NextResponse.json(
        { success: false, message: 'Configuración del servidor incompleta' },
        { status: 503 }
      )
    }

    // Validar credenciales
    if (username === adminUsername && password === adminPassword) {
      // Generar token JWT
      const token = jwt.sign(
        { 
          username: adminUsername,
          role: 'admin',
          iat: Math.floor(Date.now() / 1000)
        },
        jwtSecret,
        { expiresIn: '24h' }
      )

      // Crear respuesta con cookie httpOnly
      const response = NextResponse.json({ 
        success: true,
        message: 'Login exitoso'
      })

      // Configurar cookie httpOnly para mayor seguridad
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 horas
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, message: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { success: false, message: 'Error al procesar el login' },
      { status: 500 }
    )
  }
}


