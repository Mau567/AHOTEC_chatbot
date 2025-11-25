import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-here'

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { username: string; role: string }
      return NextResponse.json({ 
        authenticated: true,
        username: decoded.username,
        role: decoded.role
      })
    } catch (error) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error verificando token:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}


