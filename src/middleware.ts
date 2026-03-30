import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/reset-password']
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password']
const COOKIE_NAME = 'calhub_token'

// Simple in-memory rate limiter (resets on cold start)
const requestCounts = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = requestCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}

// Edge-compatible JWT verification using Web Crypto API
async function verifyJWT(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [rawHeader, rawPayload, rawSignature] = parts

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const key = await crypto.subtle.importKey(
      'raw',
      secret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    // base64url → base64 → Uint8Array
    const b64 = rawSignature.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(b64)
    const signature = Uint8Array.from(binary, c => c.charCodeAt(0))

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(`${rawHeader}.${rawPayload}`),
    )
    if (!valid) return null

    const payload = JSON.parse(
      atob(rawPayload.replace(/-/g, '+').replace(/_/g, '/')),
    )

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

    return { userId: payload.userId, email: payload.email }
  } catch {
    return null
  }
}

function getToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  // Rate limiting for analyze endpoint
  if (pathname === '/api/analyze') {
    if (!rateLimit(`analyze:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { data: null, error: 'Хэт олон хүсэлт. 1 минутын дараа дахин оролдоно уу.' },
        { status: 429 },
      )
    }
  }

  if (pathname.startsWith('/api/') && !PUBLIC_API_PATHS.includes(pathname)) {
    if (!rateLimit(`api:${ip}`, 60, 60_000)) {
      return NextResponse.json({ data: null, error: 'Хэт олон хүсэлт.' }, { status: 429 })
    }
  }

  // Allow public API paths without auth
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protect API routes
  if (pathname.startsWith('/api/')) {
    const token = getToken(request)
    const payload = token ? await verifyJWT(token) : null

    if (!payload) {
      return NextResponse.json({ data: null, error: 'Нэвтрэх шаардлагатай.' }, { status: 401 })
    }

    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    return response
  }

  // Redirect authenticated users away from auth pages
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    const token = getToken(request)
    const payload = token ? await verifyJWT(token) : null
    if (payload) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protect dashboard routes
  const token = getToken(request)
  const payload = token ? await verifyJWT(token) : null

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
