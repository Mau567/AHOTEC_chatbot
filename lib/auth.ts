import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthResult {
  authenticated: boolean
  username?: string
  role?: string
}

export function verifyAuth(request: NextRequest): AuthResult {
  try {
    const token = request.cookies.get('admin-token')?.value
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-here'

    if (!token) {
      return { authenticated: false }
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { username: string; role: string }
      return {
        authenticated: true,
        username: decoded.username,
        role: decoded.role
      }
    } catch (error) {
      return { authenticated: false }
    }
  } catch (error) {
    return { authenticated: false }
  }
}


