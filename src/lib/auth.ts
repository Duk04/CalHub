import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
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

// Password-reset tokens use a composite secret (JWT_SECRET + current passwordHash)
// so the token is automatically invalidated when the password changes.
function resetSecret(passwordHash: string) {
  return new TextEncoder().encode(`${process.env.JWT_SECRET!}:${passwordHash}`)
}

export function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload } as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = typeof payload.userId === 'string' ? payload.userId : null
    const email = typeof payload.email === 'string' ? payload.email : null
    if (!userId || !email) return null
    return { userId, email }
  } catch {
    return null
  }
}

export function signPasswordResetToken({ userId, email, passwordHash }: JwtPayload & { passwordHash: string }): Promise<string> {
  return new SignJWT({ userId, email, purpose: 'password_reset' } as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(resetSecret(passwordHash))
}

export async function verifyPasswordResetToken(token: string, passwordHash: string): Promise<(JwtPayload & { purpose: string }) | null> {
  try {
    const { payload } = await jwtVerify(token, resetSecret(passwordHash))
    if (payload.purpose !== 'password_reset') return null
    const userId = typeof payload.userId === 'string' ? payload.userId : null
    const email = typeof payload.email === 'string' ? payload.email : null
    if (!userId || !email) return null
    return { userId, email, purpose: 'password_reset' }
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

export function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set('calhub_lang', locale === 'en' ? 'en' : 'mn', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
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
  const payload = await verifyToken(token)
  return payload?.userId ?? null
}
