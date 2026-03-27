import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ data: null, error: null })
  clearAuthCookie(response)
  return response
}
