import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!
export const COOKIE_NAME = 'calhub_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: COOKIE_MAX_AGE,
  path: '/',
}

interface JwtPayload {
  userId: string
  email: string
}

interface PasswordResetTokenPayload extends JwtPayload {
  purpose: 'password_reset'
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function signPasswordResetToken({
  userId,
  email,
  passwordHash,
}: JwtPayload & { passwordHash: string }): string {
  return jwt.sign(
    { userId, email, purpose: 'password_reset' satisfies PasswordResetTokenPayload['purpose'] },
    `${JWT_SECRET}:${passwordHash}`,
    { expiresIn: '1h' },
  )
}

export function verifyPasswordResetToken(token: string, passwordHash: string): PasswordResetTokenPayload | null {
  try {
    const payload = jwt.verify(token, `${JWT_SECRET}:${passwordHash}`) as PasswordResetTokenPayload
    return payload.purpose === 'password_reset' ? payload : null
  } catch {
    return null
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(COOKIE_NAME)
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value ?? null
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null
}

export async function getCurrentUserId(): Promise<string | null> {
  const token = await getTokenFromCookies()
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId ?? null
}
