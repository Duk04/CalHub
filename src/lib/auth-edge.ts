import { jwtVerify } from 'jose'

interface JwtPayload {
  userId: string
  email: string
}

export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  const secret = process.env.JWT_SECRET
  if (!secret) return null

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    const userId = typeof payload.userId === 'string' ? payload.userId : null
    const email = typeof payload.email === 'string' ? payload.email : null

    if (!userId || !email) return null
    return { userId, email }
  } catch {
    return null
  }
}