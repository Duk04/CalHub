import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signPasswordResetToken } from '@/lib/auth'
import { isMailConfigured, sendPasswordResetEmail } from '@/lib/mailer'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

function getAppUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  return new URL(request.url).origin
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 },
      )
    }

    const email = result.data.email.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    })

    if (user) {
      const token = signPasswordResetToken({
        userId: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
      })

      const resetUrl = `${getAppUrl(request)}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`
      await sendPasswordResetEmail({ to: user.email, resetUrl })
    }

    return NextResponse.json({
      data: { configured: isMailConfigured() },
      error: null,
      message: isMailConfigured()
        ? 'If an account exists for that email, a reset link has been sent.'
        : 'SMTP is not configured. In development, the reset link is logged on the server.',
    })
  } catch (error) {
    console.error('[forgot-password]', error)
    return NextResponse.json(
      { data: null, error: 'Failed to process password reset request.' },
      { status: 500 },
    )
  }
}
