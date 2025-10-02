import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.API_SECURE_JWT

if (!JWT_SECRET) {
  throw new Error('Invalid/Missing environment variable: "API_SECURE_JWT"')
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}